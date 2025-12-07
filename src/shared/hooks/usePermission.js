import { useContext } from 'react';
import { PermissionContext } from '../contexts/PermissionContext';
import { PERMISSION_CODES, PERMISSION_TYPES } from '../constants/permissions';

/**
 * useUserPermissions - Hook để check quyền của user
 * Lấy dữ liệu quyền từ PermissionContext (được fetch khi select workspace)
 */
export const useUserPermissions = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('useUserPermissions must be used within PermissionProvider');
  }

  const { hasPermission, loading, permissions } = context;

  /**
   * Kiểm tra user có tất cả quyền trong danh sách không
   * @param {string[]} permissionCodes - Danh sách mã quyền
   * @param {string} type - Loại quyền
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionCodes, type = PERMISSION_TYPES.ENTERPRISE) => {
    return permissionCodes.every((code) => hasPermission(code, type));
  };

  /**
   * Kiểm tra user có bất kỳ quyền nào trong danh sách không
   * @param {string[]} permissionCodes - Danh sách mã quyền
   * @param {string} type - Loại quyền
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionCodes, type = PERMISSION_TYPES.ENTERPRISE) => {
    return permissionCodes.some((code) => hasPermission(code, type));
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    loading,
    permissions,
  };
};

export default useUserPermissions;
