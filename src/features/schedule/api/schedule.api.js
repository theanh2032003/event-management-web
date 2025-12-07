import axiosClient from '../../../app/axios/axiosClient';
/**
 * Schedule API - Quản lý lịch trình
 * Base URL: /event-manage/project/{projectId}/schedule
 */
const scheduleApi = {
  /**
   * Lấy chi tiết lịch trình
   * GET /event-manage/project/{projectId}/schedule/{scheduleId}
   * @param {number} projectId - ID của dự án
   * @param {number} scheduleId - ID của lịch trình
   * @returns {Promise} Chi tiết lịch trình
   */
  getDetail: (projectId, scheduleId) => {
    const url = `/project/${projectId}/schedule/${scheduleId}`;
    return axiosClient.get(url);
  },

  /**
   * Lấy danh sách lịch trình
   * GET /event-manage/project/{projectId}/schedule
   * @param {number} projectId - ID của dự án
   * @returns {Promise} Danh sách lịch trình
   */
  getAll: (projectId) => {
    const url = `/project/${projectId}/schedule`;
    return axiosClient.get(url);
  },

  /**
   * Tạo lịch trình mới
   * POST /event-manage/project/{projectId}/schedule
   * @param {number} projectId - ID của dự án
   * @param {object} data - Dữ liệu lịch trình
   * @returns {Promise} Lịch trình đã tạo
   */
  create: (projectId, data) => {
    const url = `/project/${projectId}/schedule`;
    return axiosClient.post(url, data);
  },

  /**
   * Cập nhật lịch trình
   * PUT /event-manage/project/{projectId}/schedule/{scheduleId}
   * @param {number} projectId - ID của dự án
   * @param {number} scheduleId - ID của lịch trình
   * @param {object} data - Dữ liệu lịch trình
   * @returns {Promise} Lịch trình đã cập nhật
   */
  update: (projectId, scheduleId, data) => {
    const url = `/project/${projectId}/schedule/${scheduleId}`;
    return axiosClient.put(url, data);
  },

  /**
   * Xóa lịch trình
   * DELETE /event-manage/project/{projectId}/schedule/{scheduleId}
   * @param {number} projectId - ID của dự án
   * @param {number} scheduleId - ID của lịch trình
   * @returns {Promise}
   */
  delete: (projectId, scheduleId) => {
    const url = `/project/${projectId}/schedule/${scheduleId}`;
    return axiosClient.delete(url);
  },
};

export default scheduleApi;
