import axiosClient from '../../../app/axios/axiosClient';
import { v4 as uuidv4 } from 'uuid';

// Get or generate device ID from localStorage
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

const DEVICE_ID = getDeviceId();

// Auth API endpoints
const authApi = {
  // Register new client
  register: (userData) => {
    return axiosClient.post('/auth/register', userData);
  },

  // Login client
  login: async (loginData) => {
    const response = await axiosClient.post('/auth/login', loginData, {
      headers: {
        'device-id': DEVICE_ID
      }
    });
    console.log('Login response:', response);
    return response;
  },

  // Logout client
  logout: () => {
    return axiosClient.post('/auth/logout', {}, {
      headers: {
        'device-id': DEVICE_ID
      }
    });
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/refresh-token', { token: refreshToken });
  },

  // Resend OTP
  resendOtp: (email) => {
    return axiosClient.post('/auth/resend-otp', { token: email });
  },

  // Verify OTP
  verifyOtp: (email, otp) => {
    return axiosClient.post('/auth/verify', { email, code: otp });
  },

  // Reset password with OTP
  resetPassword: (email, otp, newPassword) => {
    return axiosClient.post('/auth/change-password', { email, otp, newPassword });
  },

  // Get client profile
  getProfile: () => {
    return axiosClient.get('/client/profile');
  },

  // Update client profile
  updateProfile: (userData) => {
    return axiosClient.put('/client/profile', userData);
  },

  // Switch to supplier workspace
  switchSupplier: async (supplierId) => {
    const response = await axiosClient.post(`/auth/switch/supplier/${supplierId}`, {});
    return response;
  },

  // Switch to enterprise workspace
  switchEnterprise: async (enterpriseId) => {
    const response = await axiosClient.post(`/auth/switch/enterprise/${enterpriseId}`, {});
    return response;
  },
};

export default authApi;