import { useState, useEffect, useCallback } from 'react';
import roleApi from '../api/role.api';

/**
 * Lấy owner flag từ token trong localStorage
 * @returns {boolean} true nếu user là owner
 */
const getIsOwner = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Decode JWT token (format: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload - add base64 padding if needed
    let payload = parts[1];
    switch (payload.length % 4) {
      case 0:
        break;
      case 2:
        payload += '==';
        break;
      case 3:
        payload += '=';
        break;
      default:
        throw new Error('Invalid token');
    }
    
    const decoded = JSON.parse(atob(payload));
    console.log('[PROJECT] 👤 Token payload:', decoded);
    
    const isOwner = decoded?.owner === true;
    console.log('[PROJECT] 🔑 Is Owner:', isOwner);
    
    return isOwner;
  } catch (err) {
    console.error('[PROJECT] ❌ Error decoding token:', err);
    return false;
  }
};

/**
 * Hook để quản lý quyền của user ở cấp PROJECT/EVENT
 * Dùng cho EventDetail tabs: Schedule, Users, Roles, etc.
 * 
 * Nếu user là owner → bypass tất cả permission checks
 * Nếu user là creator của event → bypass tất cả permission checks
 * Nếu user bình thường → fetch quyền PROJECT level
 * 
 * @param {string} projectId - ID của project/event
 * @param {string} userId - ID của user
 * @returns {Object} { 
 *   permissions,       // Array of permission objects with 'code' property
 *   loading,          // Boolean indicating if fetching
 *   error,            // Error message if any
 *   hasPermission,    // Function to check if user has specific permission code
 *   hasAnyPermission, // Function to check if user has any of given permission codes
 *   hasAllPermissions,// Function to check if user has all given permission codes
 *   refetch,          // Function to refetch permissions
 *   isOwner           // Boolean indicating if user is owner
 * }
 */
const useProjectUserPermissions = (projectId, userId) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const fetchUserPermissions = useCallback(async () => {
    if (!userId || !projectId) {
      console.log('[PROJECT] ⚠️ Missing userId or projectId:', { userId, projectId });
      setLoading(false);
      return;
    }

    // Check xem user có phải owner không
    const ownerFlag = getIsOwner();
    setIsOwner(ownerFlag);
    
    // Nếu là owner, không cần fetch quyền - cấp tất cả quyền
    if (ownerFlag) {
      console.log('[PROJECT] 👑 User is OWNER - All permissions granted!');
      setPermissions(['all']); // Mark as owner
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[PROJECT] 🔐 Fetching PROJECT-level permissions for userId:', userId, 'projectId:', projectId);
      const response = await roleApi.getUserPermissions(projectId, userId);
      
      // Debug: log raw response with full structure
      console.log('[PROJECT] 🔍 Raw API response:', response);
      console.log('[PROJECT] 📦 Response type:', typeof response);
      console.log('[PROJECT] 📊 Is array?', Array.isArray(response));
      console.log('[PROJECT] 🔑 Response keys:', Object.keys(response || {}));
      
      // Handle different response structures
      let permissionList = [];
      
      if (Array.isArray(response)) {
        permissionList = response;
        console.log('[PROJECT] ✅ Response is direct array');
      } else if (response?.permissions && Array.isArray(response.permissions)) {
        // API returns {permissions: Array, roles: Array}
        permissionList = response.permissions;
        console.log('[PROJECT] ✅ Response has .permissions property (array)');
      } else if (response?.data && Array.isArray(response.data)) {
        permissionList = response.data;
        console.log('[PROJECT] ✅ Response has .data property (array)');
      } else if (response?.result && Array.isArray(response.result)) {
        permissionList = response.result;
        console.log('[PROJECT] ✅ Response has .result property (array)');
      } else {
        console.warn('[PROJECT] ⚠️ Unknown response structure:', response);
        permissionList = [];
      }
      
      console.log('[PROJECT] ✅ User permissions processed:', permissionList);
      console.log('[PROJECT] 📋 Permission items:', permissionList.map(p => ({ code: p?.code, permissionCode: p?.permissionCode, id: p?.id })));
      setPermissions(permissionList);
    } catch (err) {
      console.error('[PROJECT] ❌ Error fetching user permissions:', err);
      console.error('[PROJECT] ❌ Error details:', err.response?.data);
      setError(err.message || 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, userId]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  /**
   * Kiểm tra user có quyền cụ thể hay không
   * 👑 Nếu user là owner → trả về true cho TẤT CẢ quyền
   * 👤 Nếu user bình thường → check quyền thực tế
   * @param {string} permissionCode - Mã quyền (e.g., 'project_schedule_manage', 'project_user_manage')
   * @returns {boolean}
   */
  const hasPermission = useCallback((permissionCode) => {
    // 👑 OWNER BYPASS: Nếu là owner, cấp toàn bộ quyền
    if (isOwner) {
      console.log(`[PROJECT] ✅ Owner access granted for: ${permissionCode}`);
      return true;
    }
    
    // 👤 Kiểm tra quyền thực tế nếu không phải owner
    if (!Array.isArray(permissions)) {
      console.log(`[PROJECT] ❌ Permissions is not an array:`, permissions, 'type:', typeof permissions);
      return false;
    }
    
    if (permissions.length === 0) {
      console.log(`[PROJECT] ⚠️ User has NO permissions (empty array)`);
      return false;
    }
    
    const hasIt = permissions.some(p => {
      // Support multiple formats: code, permissionCode, permission.code
      const pCode = p?.code || p?.permissionCode || p?.permission?.code;
      const matches = pCode === permissionCode;
      
      if (matches) {
        console.log(`[PROJECT] ✅ Found matching permission:`, { requested: permissionCode, actual: pCode, fullObject: p });
      }
      
      return matches;
    });
    
    if (!hasIt) {
      console.log(`[PROJECT] ❌ Permission NOT found:`, permissionCode);
      console.log(`[PROJECT] 📋 Available permissions:`, permissions.map(p => ({
        code: p?.code,
        permissionCode: p?.permissionCode,
        permission: p?.permission,
        fullObject: p
      })));
    }
    
    return hasIt;
  }, [permissions, isOwner]);

  /**
   * Kiểm tra user có ít nhất một trong các quyền
   * 👑 Nếu owner → luôn true
   * @param {string[]} permissionCodes - Mảng mã quyền
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback((permissionCodes) => {
    // 👑 Owner bypass
    if (isOwner) return true;
    
    if (!Array.isArray(permissionCodes)) return false;
    return permissionCodes.some(code => hasPermission(code));
  }, [hasPermission, isOwner]);

  /**
   * Kiểm tra user có tất cả các quyền
   * 👑 Nếu owner → luôn true
   * @param {string[]} permissionCodes - Mảng mã quyền
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback((permissionCodes) => {
    // 👑 Owner bypass
    if (isOwner) return true;
    
    if (!Array.isArray(permissionCodes)) return false;
    return permissionCodes.every(code => hasPermission(code));
  }, [hasPermission, isOwner]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchUserPermissions,
    isOwner,
  };
};

export default useProjectUserPermissions;
