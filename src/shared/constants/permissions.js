/**
 * Permission Codes - Mã quyền dùng trong hệ thống
 * 
 * Các quyền được chia thành 2 loại:
 * - ENTERPRISE: Quyền ở cấp doanh nghiệp
 * - PROJECT: Quyền ở cấp dự án/sự kiện
 */

export const PERMISSION_CODES = {
  // ==================== ENTERPRISE PERMISSIONS ====================
  TASK_STATE_MANAGE: 'task_state_manage',        // Quản lý trạng thái công việc
  TASK_TYPE_MANAGE: 'task_type_manage',          // Quản lý loại công việc
  LOCATION_MANAGE: 'location_manage',            // Quản lý địa điểm
  ROLE_MANAGE: 'role_manage',                    // Quản lý vai trò (ENTERPRISE)
  ENTERPRISE_USER_MANAGE: 'enterprise_user_manage', // Quản lý người dùng
  STATISTICAL_VIEW: 'statistical_view',          // Xem thống kê
  PROJECT_CREATE: 'project_create',              // Tạo sự kiện

  // ==================== PROJECT PERMISSIONS ====================
  PROJECT_SCHEDULE_MANAGE: 'project_schedule_manage', // Quản lý lịch trình
  PROJECT_USER_MANAGE: 'project_user_manage',        // Quản lý người dùng (PROJECT)
  PROJECT_ROLE_MANAGE: 'project_role_manage',        // Quản lý vai trò (PROJECT)
};

export const PERMISSION_TYPES = {
  ENTERPRISE: 'ENTERPRISE',
  PROJECT: 'PROJECT',
};

/**
 * Bản đồ quyền theo từng tính năng
 * Sử dụng để hiển thị/ẩn các tab hoặc tính năng cụ thể
 */
export const FEATURE_PERMISSIONS = {
  TASK_STATE_MANAGEMENT: {
    code: PERMISSION_CODES.TASK_STATE_MANAGE,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Quản lý trạng thái công việc',
  },
  TASK_CATEGORY_MANAGEMENT: {
    code: PERMISSION_CODES.TASK_TYPE_MANAGE,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Quản lý loại công việc',
  },
  LOCATION_MANAGEMENT: {
    code: PERMISSION_CODES.LOCATION_MANAGE,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Quản lý địa điểm',
  },
  ROLE_MANAGEMENT: {
    code: PERMISSION_CODES.ROLE_MANAGE,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Quản lý vai trò',
  },
  USER_MANAGEMENT: {
    code: PERMISSION_CODES.ENTERPRISE_USER_MANAGE,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Quản lý nhân sự doanh nghiệp',
  },
  STATISTICS: {
    code: PERMISSION_CODES.STATISTICAL_VIEW,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Xem thống kê',
  },
  PROJECT_CREATE: {
    code: PERMISSION_CODES.PROJECT_CREATE,
    type: PERMISSION_TYPES.ENTERPRISE,
    label: 'Tạo sự kiện',
  },
  PROJECT_SCHEDULE_MANAGEMENT: {
    code: PERMISSION_CODES.PROJECT_SCHEDULE_MANAGE,
    type: PERMISSION_TYPES.PROJECT,
    label: 'Quản lý lịch trình',
  },
  PROJECT_USER_MANAGEMENT: {
    code: PERMISSION_CODES.PROJECT_USER_MANAGE,
    type: PERMISSION_TYPES.PROJECT,
    label: 'Quản lý nhân sự sự kiện',
  },
  PROJECT_ROLE_MANAGEMENT: {
    code: PERMISSION_CODES.PROJECT_ROLE_MANAGE,
    type: PERMISSION_TYPES.PROJECT,
    label: 'Quản lý vai trò',
  },
};
