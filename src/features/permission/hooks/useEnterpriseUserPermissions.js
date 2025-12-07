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
    console.log('[ENTERPRISE] 👤 Token payload:', decoded);
    
    const isOwner = decoded?.owner === true;
    console.log('[ENTERPRISE] 🔑 Is Owner:', isOwner);
    
    return isOwner;
  } catch (err) {
    console.error('[ENTERPRISE] ❌ Error decoding token:', err);
    return false;
  }
};

/**
 * Hook để quản lý quyền của user ở cấp ENTERPRISE
 * Dùng cho Settings tabs: Roles, Users, Permissions, etc.
 * 
 * Nếu user là owner → bypass tất cả permission checks
 * Nếu user bình thường → fetch quyền ENTERPRISE level
 * 
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
const useEnterpriseUserPermissions = (userId) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const fetchUserPermissions = useCallback(async () => {
    // Check xem user có phải owner không (luôn check, dù có userId hay không)
    const ownerFlag = getIsOwner();
    console.log('[ENTERPRISE] 👤 Checking owner flag:', ownerFlag);
    setIsOwner(ownerFlag);
    
    // Nếu là owner, không cần fetch quyền - cấp tất cả quyền
    if (ownerFlag) {
      console.log('[ENTERPRISE] 👑 User is OWNER - All permissions granted!');
      setPermissions(['all']); // Mark as owner
      setLoading(false);
      return;
    }

    if (!userId) {
      console.log('[ENTERPRISE] ⚠️ No userId provided, and user is not owner');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await roleApi.getEnterpriseUserPermissions(userId);
      
      // Handle different response structures
      let permissionList = [];
      
      if (Array.isArray(response)) {
        permissionList = response;
        console.log('[ENTERPRISE] ✅ Response is direct array');
      } else if (response?.permissions && Array.isArray(response.permissions)) {
        // API returns {permissions: Array, roles: Array}
        permissionList = response.permissions;
        console.log('[ENTERPRISE] ✅ Response has .permissions property (array)');
      } else if (response?.data && Array.isArray(response.data)) {
        permissionList = response.data;
        console.log('[ENTERPRISE] ✅ Response has .data property (array)');
      } else if (response?.result && Array.isArray(response.result)) {
        permissionList = response.result;
        console.log('[ENTERPRISE] ✅ Response has .result property (array)');
      } else {
        console.warn('[ENTERPRISE] ⚠️ Unknown response structure:', response);
        permissionList = [];
      }
      
      console.log('[ENTERPRISE] ✅ User permissions processed:', permissionList);
      console.log('[ENTERPRISE] 📋 Permission items:', permissionList.map(p => ({ code: p?.code, permissionCode: p?.permissionCode, id: p?.id })));
      setPermissions(permissionList);
    } catch (err) {
      console.error('[ENTERPRISE] ❌ Error fetching user permissions:', err);
      console.error('[ENTERPRISE] ❌ Error details:', err.response?.data);
      setError(err.message || 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  /**
   * Kiểm tra user có quyền cụ thể hay không
   * 👑 Nếu user là owner → trả về true cho TẤT CẢ quyền
   * 👤 Nếu user bình thường → check quyền thực tế
   * @param {string} permissionCode - Mã quyền (e.g., 'role_manage', 'user_manage')
   * @returns {boolean}
   */
  const hasPermission = useCallback((permissionCode) => {
    // 👑 OWNER BYPASS: Nếu là owner, cấp toàn bộ quyền
    if (isOwner) {
      console.log(`[ENTERPRISE] ✅ Owner access granted for: ${permissionCode}`);
      return true;
    }
    
    // 👤 Kiểm tra quyền thực tế nếu không phải owner
    if (!Array.isArray(permissions)) {
      console.log(`[ENTERPRISE] ❌ Permissions is not an array:`, permissions, 'type:', typeof permissions);
      return false;
    }
    
    if (permissions.length === 0) {
      console.log(`[ENTERPRISE] ⚠️ User has NO permissions (empty array)`);
      return false;
    }
    
    const hasIt = permissions.some(p => {
      // Support multiple formats: code, permissionCode, permission.code
      const pCode = p?.code || p?.permissionCode || p?.permission?.code;
      const matches = pCode === permissionCode;
      
      if (matches) {
        console.log(`[ENTERPRISE] ✅ Found matching permission:`, { requested: permissionCode, actual: pCode, fullObject: p });
      }
      
      return matches;
    });
    
    if (!hasIt) {
      console.log(`[ENTERPRISE] ❌ Permission NOT found:`, permissionCode);
      console.log(`[ENTERPRISE] 📋 Available permissions:`, permissions.map(p => ({
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

export default useEnterpriseUserPermissions;
export { getIsOwner };
