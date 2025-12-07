import React from 'react';
import { useUserPermissions } from '../hooks/usePermission';

/**
 * ProtectedRoute - Wrapper để check quyền và truyền vào component
 * Thay vì redirect, nó sẽ pass permission status vào component
 * Component tự quyết định cách xử lý (show alert hoặc disable API call)
 * 
 * @param {React.Component} Component - Component cần render
 * @param {string|string[]} requiredPermissions - Quyền cần có
 * @param {string} permissionType - ENTERPRISE hoặc PROJECT
 * @param {*} rest - Props khác
 */
export const ProtectedRoute = ({
  Component,
  requiredPermissions,
  permissionType = 'ENTERPRISE',
  ...rest
}) => {
  const { hasPermission, loading } = useUserPermissions();

  if (loading) {
    return <div>Loading...</div>; // Có thể thay bằng LoadingSpinner component
  }

  // Nếu requiredPermissions là array, check có bất kỳ quyền nào
  const permissionsToCheck = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  const hasRequiredPermission = permissionsToCheck.some((permission) =>
    hasPermission(permission, permissionType)
  );

  // Truyền permission status vào component thay vì redirect
  return (
    <Component
      {...rest}
      hasPermission={hasRequiredPermission}
      requiredPermissions={requiredPermissions}
      permissionType={permissionType}
    />
  );
};

export default ProtectedRoute;
