import axiosClient from '../../../app/axios/axiosClient';

/**
 * Check-in API - Quản lý lịch sử check-in
 */
const checkinApi = {
  /**
   * Lấy danh sách vé đã check-in của sự kiện
   * GET /tickets/checked-in/{eventId}
   * @param {number} eventId - ID của sự kiện
   * @param {object} params - Query params (page, size, sort, keyword)
   * @returns {Promise} Danh sách vé đã check-in
   */
  getCheckedInTickets: (eventId, params = {}) => {
    const url = `/tickets/checked-in/${eventId}`;
    return axiosClient.get(url, { params });
  },
};

export default checkinApi;
