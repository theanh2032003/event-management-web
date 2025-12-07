import axiosClient from '../../../app/axios/axiosClient';

/**
 * Stage API - Quản lý giai đoạn
 * Base URL: /event-manage/project/{projectId}/stage
 */
const stageApi = {
  /**
   * Lấy danh sách giai đoạn
   * GET /event-manage/project/{projectId}/stage
   * @param {number} projectId - ID của dự án
   * @param {object} params - Query params (page, size, sort, etc.)
   * @returns {Promise} Danh sách giai đoạn
   */
  getAll: (projectId, params = {}) => {
    const url = `/project/${projectId}/stage`;
    return axiosClient.get(url, { params });
  },

  /**
   * Tạo giai đoạn mới
   * POST /event-manage/project/{projectId}/stage
   * @param {number} projectId - ID của dự án
   * @param {object} data - Dữ liệu giai đoạn
   * @returns {Promise} Giai đoạn đã tạo
   */
  create: (projectId, data) => {
    const url = `/project/${projectId}/stage`;
    return axiosClient.post(url, data);
  },

  /**
   * Cập nhật giai đoạn
   * PUT /event-manage/project/{projectId}/stage/{stageId}
   * @param {number} projectId - ID của dự án
   * @param {number} stageId - ID của giai đoạn
   * @param {object} data - Dữ liệu giai đoạn
   * @returns {Promise} Giai đoạn đã cập nhật
   */
  update: (projectId, stageId, data) => {
    const url = `/project/${projectId}/stage/${stageId}`;
    return axiosClient.put(url, data);
  },

  /**
   * Cập nhật trạng thái giai đoạn
   * PATCH /event-manage/project/{projectId}/stage/{stageId}
   * @param {number} projectId - ID của dự án
   * @param {number} stageId - ID của giai đoạn
   * @param {string} status - Trạng thái mới (PENDING, IN_PROGRESS, DONE, CANCELLED)
   * @returns {Promise} Giai đoạn đã cập nhật
   */
  updateStatus: (projectId, stageId, status) => {
    const url = `/project/${projectId}/stage/${stageId}`;
    return axiosClient.patch(url, { status });
  },

  /**
   * Xóa giai đoạn
   * DELETE /event-manage/project/{projectId}/stage/{stageId}
   * @param {number} projectId - ID của dự án
   * @param {number} stageId - ID của giai đoạn
   * @returns {Promise}
   */
  delete: (projectId, stageId) => {
    const url = `/project/${projectId}/stage/${stageId}`;
    return axiosClient.delete(url);
  },

  /**
   * Lấy danh sách người dùng trong giai đoạn
   * GET /project/{projectId}/stage/{stageId}/user
   * @param {number} projectId - ID của dự án
   * @param {number} stageId - ID của giai đoạn
   * @returns {Promise} Danh sách người dùng
   */
  getUsers: (projectId, stageId) => {
    const url = `/project/${projectId}/stage/${stageId}/user`;
    return axiosClient.get(url);
  },
};

export default stageApi;
