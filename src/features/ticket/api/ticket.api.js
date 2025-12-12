import axiosClient from '../../../app/axios/axiosClient';

/**
 * Ticket API - Quản lý vé sự kiện
 */
const ticketApi = {
  /**
   * Lấy danh sách loại vé của sự kiện
   * GET /ticket-types/event/{eventId}
   * @param {number} eventId - ID của sự kiện
   * @returns {Promise} Danh sách loại vé
   */
  getTicketTypes: (eventId) => {
    const url = `/ticket-types/event/${eventId}`;
    return axiosClient.get(url);
  },

  /**
   * Lấy danh sách tất cả vé của sự kiện
   * GET /tickets/event/{eventId}
   * @param {number} eventId - ID của sự kiện
   * @param {object} params - Query params (page, size)
   * @returns {Promise} Danh sách vé đã bán
   */
  getEventTickets: (eventId, params = {}) => {
    const url = `/tickets/event/${eventId}`;
    return axiosClient.get(url, { params });
  },
};

export default ticketApi;
