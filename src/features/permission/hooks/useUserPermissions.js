/**
 * ⚠️ DEPRECATED: Sử dụng `useEnterpriseUserPermissions` hoặc `useProjectUserPermissions` thay vào
 * 
 * Hook cũ này vẫn tồn tại cho backward compatibility nhưng sẽ được remove trong tương lai
 * Vui lòng migrate sang 2 hooks mới để tránh nhầm lẫn giữa 2 loại quyền
 */

import { useState, useEffect, useCallback } from 'react';
import roleApi from '../api/roleApi';

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
    
    const isOwner = decoded?.owner === true;
    
    return isOwner;
  } catch (err) {
    console.error('❌ Error decoding token:', err);
    return false;
  }
};

/**
 * ⚠️ DEPRECATED HOOK - Sử dụng `useEnterpriseUserPermissions` hoặc `useProjectUserPermissions` thay vào
 * 
 * Hook để quản lý quyền của user
 * Fetch và cache quyền của user trong project/enterprise
 * 
 * Nếu user là owner → bypass tất cả permission checks
 * Nếu user bình thường → fetch quyền và check
 * 
 * @param {string} projectId - ID của doanh nghiệp/dự án (nếu null, fetch enterprise permissions)
 * @param {string} userId - ID của user
 * @param {boolean} isProjectLevel - true = project level, false = enterprise level
 * @returns {Object} { permissions, loading, error, hasPermission, hasAnyPermission, hasAllPermissions, refetch, isOwner }
 */
const useUserPermissions = (projectId, userId, isProjectLevel = false) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const fetchUserPermissions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check xem user có phải owner không
    const ownerFlag = getIsOwner();
    setIsOwner(ownerFlag);
    
    // Nếu là owner, không cần fetch quyền - cấp tất cả quyền
    if (ownerFlag) {
      console.log('👑 User is OWNER - All permissions granted!');
      setPermissions(['all']); // Mark as owner
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Nếu là project level, gọi với projectId
      if (isProjectLevel && projectId) {
        console.log('🔐 Fetching PROJECT-level permissions for userId:', userId, 'projectId:', projectId);
        response = await roleApi.getUserPermissions(projectId, userId);
      } else {
        // Nếu là enterprise level, gọi không có projectId
        console.log('🔐 Fetching ENTERPRISE-level permissions for userId:', userId);
        response = await roleApi.getEnterpriseUserPermissions(userId);
      }
      
      // Debug: log raw response
      console.log('🔍 Raw API response:', response);
      
      // Assume response is an array of permission objects or contains an array
      // Handle both: direct array response and {data: array} structure
      let permissionList = [];
      
      if (Array.isArray(response)) {
        permissionList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        permissionList = response.data;
      } else if (response && typeof response === 'object') {
        // If response is an object but not an array, try to get data property
        permissionList = Array.isArray(response) ? response : [];
      }
      
      console.log('✅ User permissions processed:', permissionList);
      setPermissions(permissionList);
    } catch (err) {
      console.error('❌ Error fetching user permissions:', err);
      setError(err.message || 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, userId, isProjectLevel]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  /**
   * Kiểm tra user có quyền cụ thể hay không
   * 👑 Nếu user là owner → trả về true cho TẤT CẢ quyền
   * 👤 Nếu user bình thường → check quyền thực tế
   * @param {string} permissionCode - Mã quyền (e.g., 'role_manage', 'task_state_manage')
   * @returns {boolean}
   */
  const hasPermission = useCallback((permissionCode) => {
    // 👑 OWNER BYPASS: Nếu là owner, cấp toàn bộ quyền
    if (isOwner) {
      console.log(`✅ Owner access granted for: ${permissionCode}`);
      return true;
    }
    
    // 👤 Kiểm tra quyền thực tế nếu không phải owner
    if (!Array.isArray(permissions)) {
      console.log(`❌ Permissions is not an array:`, permissions, 'type:', typeof permissions);
      return false;
    }
    
    const hasIt = permissions.some(p => {
      const matches = p.code === permissionCode || p.permissionCode === permissionCode;
      console.log(`🔍 Checking permission "${permissionCode}" against object:`, p, 'matches:', matches);
      return matches;
    });
    
    console.log(`📊 hasPermission("${permissionCode}") result:`, hasIt, 'Available permissions:', permissions);
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
    isOwner,  // Export isOwner flag for components to use
  };
};

export default useUserPermissions;
