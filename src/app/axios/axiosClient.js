import axios from 'axios';
import { toast } from 'react-toastify';

// Use environment variable or fallback to VPS URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/event-manage';

// Determine if we should use credentials based on URL
const isDirect = API_BASE_URL.startsWith('http');

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'device-id': 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  },
  timeout: 30000, // 10 seconds timeout
  // Use credentials only when going direct to server (not through proxy)
  withCredentials: isDirect,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints (login, register, verify, etc.)
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/resend-otp',
      '/auth/change-password'
    ];
    
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    // Only add token if NOT an auth endpoint
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Log token being sent (only first 20 chars for security)
        console.log(`🔐 Token added to ${config.method?.toUpperCase()} ${config.url}:`, 
          `${token.substring(0, 20)}...`);
      } else {
        console.warn(`⚠️ No token found for ${config.method?.toUpperCase()} ${config.url}`);
      }
    }
    
    // Log request headers for debugging
    if (['put', 'post', 'delete', 'patch', 'get'].includes(config.method?.toLowerCase())) {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
        headers: {
          Authorization: config.headers.Authorization ? `Bearer ${config.headers.Authorization.substring(7, 27)}...` : 'None',
          'enterprise-id': config.headers['enterprise-id'],
          'supplier-id': config.headers['supplier-id'],
          'user-id': config.headers['user-id'],
        },
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and auto refresh token
axiosClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging POST/PUT/DELETE
    if (['put', 'post', 'delete', 'patch'].includes(response.config.method?.toLowerCase())) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} Response:`, {
        status: response.status,
        data: response.data
      });
    }
    // Return the response data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ API Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401 && !originalRequest._retry) {
        // Skip refresh for login/refresh endpoints to avoid infinite loop
        if (originalRequest.url?.includes('/auth/login') || 
            originalRequest.url?.includes('/auth/refresh-token') ||
            originalRequest.url?.includes('/auth/register')) {
          // Don't show toast for auth endpoints - let the page handle it
          console.log('⚠️ Auth endpoint returned 401:', originalRequest.url);
          return Promise.reject(error);
        }
        
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosClient(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('⚠️ No refresh token found, redirecting to login');
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          window.location.href = '/signin';
          return Promise.reject(error);
        }

        try {
          // console.log('🔄 Attempting to refresh token...');
          
          // Call refresh token API directly to avoid circular dependency
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { token: refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
                'device-id': 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
              }
            }
          );

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          if (newAccessToken) {
            // console.log('✅ Token refreshed successfully');
            
            // Update tokens in localStorage
            localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Update authorization header
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Process queued requests with new token
            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry original request
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Process queue with error
          processQueue(refreshError, null);
          isRefreshing = false;

          // Clear all auth data
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          
          // Redirect to login
          window.location.href = '/signin';
          
          return Promise.reject(refreshError);
        }
      }
      
      // Handle other error status codes
      // Skip showing toast for auth endpoints (login, register, verify, etc.)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        switch (status) {
          case 400:
            toast.error(data.message || 'Yêu cầu không hợp lệ!');
            break;
          case 403:
            toast.error(data.message || 'Truy cập bị từ chối!');
            break;
          case 404:
            toast.error(data.message || 'Không tìm thấy tài nguyên!');
            break;
          case 500:
            toast.error(data.message || 'Lỗi server! Vui lòng thử lại sau.');
            break;
          default:
            if (status !== 401) { // Don't show error toast for 401 as we already handled it
              toast.error(data.message || 'Đã xảy ra lỗi!');
            }
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      // Skip toast for auth endpoints
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        toast.error('Không thể kết nối đến server! Vui lòng kiểm tra kết nối mạng.');
      }
    } else {
      // Something else happened
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        toast.error('Đã xảy ra lỗi: ' + error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the axios instance and base URL
export { axiosClient, API_BASE_URL };

// Default export
export default axiosClient;