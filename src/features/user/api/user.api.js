import axiosClient from '../../../app/axios/axiosClient';

/**
 * User API - Quản lý người dùng trong doanh nghiệp
 */
const userApi = {
  /**
   * Lấy danh sách người dùng trong doanh nghiệp
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @returns {Promise} Danh sách người dùng
   */
  getUsers: async () => {
    try {
      const response = await axiosClient.get(`/enterprise/user`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo người dùng mới
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {object} userData - Dữ liệu người dùng
   * @returns {Promise} Người dùng đã tạo
   */
  createUser: async (userData) => {
    try {
      const response = await axiosClient.post(`/api/enterprise/user`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật người dùng
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} userId - ID của người dùng
   * @param {object} userData - Dữ liệu người dùng
   * @returns {Promise} Người dùng đã cập nhật
   */
  updateUser: async (enterpriseId, userId, userData) => {
    try {
      const response = await axiosClient.put(`/api/user`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise}
   */
  blockUser: async (userId) => {
    try {
      const response = await axiosClient.delete(`/api/enterprise/user/${userId}/block`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} userId - ID của người dùng
   * @returns {Promise} Thông tin người dùng
   */
  getUserById: async ( userId) => {
    try {
      const response = await axiosClient.get(`/api/user/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default userApi;
