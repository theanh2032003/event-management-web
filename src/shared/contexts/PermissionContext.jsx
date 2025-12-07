import React, { createContext, useState, useCallback, useEffect } from 'react';
import roleApi from '../../features/permission/api/role.api';

/**
 * PermissionContext - Quản lý quyền của user trong workspace hiện tại
 * Permission được fetch khi select workspace và lưu trong context
 * Owner có quyền truy cập tất cả (bypass tất cả checks)
 */
export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({
    enterprise: [],
    project: [],
  });
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lấy thông tin owner từ token
   */
  const checkIsOwner = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsOwner(user?.owner === true || user?.owner === 'true');
      }
    } catch (err) {
      console.warn('Failed to check owner status:', err);
      setIsOwner(false);
    }
  }, []);

  /**
   * Fetch quyền của user từ API
   * @param {string} userId - ID của user
   * @param {string} projectId - ID của project (optional)
   */
  const fetchPermissions = useCallback(async (userId, projectId = null) => {
    try {
      setLoading(true);
      setError(null);

      // Check owner status từ token
      checkIsOwner();

      const enterprisePerms = [];
      const projectPerms = [];

      // Lấy quyền ENTERPRISE
      try {
        const enterpriseResponse = await roleApi.getEnterpriseUserPermissions(userId);
        if (enterpriseResponse?.data?.permissionCodes) {
          enterprisePerms.push(...enterpriseResponse.data.permissionCodes);
        }
      } catch (err) {
        console.warn('Failed to fetch enterprise permissions:', err);
      }

      // Lấy quyền PROJECT nếu có projectId
      if (projectId) {
        try {
          const projectResponse = await roleApi.getUserPermissions(projectId, userId);
          if (projectResponse?.data?.permissionCodes) {
            projectPerms.push(...projectResponse.data.permissionCodes);
          }
        } catch (err) {
          console.warn('Failed to fetch project permissions:', err);
        }
      }

      setPermissions({
        enterprise: enterprisePerms,
        project: projectPerms,
      });
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [checkIsOwner]);

  /**
   * Kiểm tra user có quyền không
   * Owner có quyền tất cả, không cần check
   * @param {string} permissionCode - Mã quyền
   * @param {string} type - ENTERPRISE hoặc PROJECT
   * @returns {boolean}
   */
  const hasPermission = useCallback((permissionCode, type = 'ENTERPRISE') => {
    // Owner có quyền tất cả
    if (isOwner) {
      return true;
    }

    if (type === 'ENTERPRISE') {
      return permissions.enterprise.includes(permissionCode);
    } else if (type === 'PROJECT') {
      return permissions.project.includes(permissionCode);
    }
    return false;
  }, [permissions, isOwner]);

  /**
   * Reset permissions (khi logout)
   */
  const resetPermissions = useCallback(() => {
    setPermissions({
      enterprise: [],
      project: [],
    });
    setIsOwner(false);
    setError(null);
  }, []);

  const value = {
    permissions,
    isOwner,
    loading,
    error,
    fetchPermissions,
    hasPermission,
    resetPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
