import axiosClient from '../../../app/axios/axiosClient';

/**
 * Role API - Quản lý vai trò và quyền
 */
const roleApi = {
  /**
   * Lấy danh sách vai trò doanh nghiệp
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @returns {Promise} Danh sách vai trò
   */
  getRoles: async (projectId) => {
    try {
      const response = await axiosClient.get(`/role`, { params: { projectId } });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách vai trò cho project/event (có phân trang)
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} projectId - ID của project/event
   * @param {number} page - Trang (0-indexed)
   * @param {number} size - Số lượng trên trang
   * @returns {Promise} Danh sách vai trò của project
   */
  getProjectRoles: async (enterpriseId, projectId, page = 0, size = 10) => {
    try {
      const response = await axiosClient.get(`/role?projectId=${projectId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo vai trò doanh nghiệp mới
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {object} roleData - Dữ liệu vai trò {name, type, permissionIds}
   * @returns {Promise} Vai trò đã tạo
   */
  createRole: async (projectId, roleData) => {
    try {
      const response = await axiosClient.post(`/role/project/${projectId}`, roleData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật vai trò doanh nghiệp
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} roleId - ID của vai trò
   * @param {object} roleData - Dữ liệu vai trò {name, type, permissionIds}
   * @returns {Promise} Vai trò đã cập nhật
   */
  updateRole: async (projectId, roleId, roleData) => {
    try {
      const response = await axiosClient.put(`/role/${roleId}/project/${projectId}`, roleData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa vai trò doanh nghiệp
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} roleId - ID của vai trò
   * @returns {Promise} Kết quả xóa
   */
  deleteRole: async (projectId, roleId) => {
    try {
      const response = await axiosClient.delete(`/role/${roleId}/project/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== PERMISSIONS ====================

  /**
   * Lấy danh sách quyền theo loại
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} type - Loại quyền: 'ENTERPRISE' | 'PROJECT'
   * @returns {Promise} Danh sách quyền
   */
  getPermissions: async ( type = 'ENTERPRISE') => {
    try {
      const response = await axiosClient.get(`/permissions?type=${type}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy quyền của user trong enterprise
   * @param {string} userId - ID của user
   * @returns {Promise} Danh sách quyền của user
   */
  getEnterpriseUserPermissions: async (userId) => {
    try {
      const response = await axiosClient.get(`/api/user/${userId}/permission`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy quyền của user trong project
   * @param {string} projectId - ID của project/event
   * @param {string} userId - ID của user
   * @returns {Promise} Danh sách vai trò của user
   */
  getUserPermissions: async (projectId, userId) => {
    try {
      const response = await axiosClient.get(`/api/user/${userId}/permission?projectId=${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  assign: async (assignForm) => {
    try {
      const response = await axiosClient.post(
        "/api/user/assign",
        assignForm
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

};

export default roleApi;
