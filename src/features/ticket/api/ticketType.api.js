import axiosClient from '../../../app/axios/axiosClient';

const ticketTypeApi = {
  /**
   * Get all ticket types for an event
   * GET /ticket-types/event/{eventId}/pageable
   */
  getTicketTypes: (eventId) => {
    const userId = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id
      : null;

    return axiosClient.get(`/ticket-types/event/${eventId}`, {
      headers: {
        "user-id": userId,
      },
    });
  },

  /**
   * Create new ticket type
   * POST /ticket-types
   */
  createTicketType: (data) => {
    const enterpriseId = localStorage.getItem("enterprise-id")

    return axiosClient.post(`/ticket-types`, data, {
      headers: {
        "enterprise-id": enterpriseId,
      },
    });
  },

  /**
   * Update ticket type
   * PUT /ticket-types/{id}
   */
  updateTicketType: (id, data) => {
    const userId = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id
      : null;

    return axiosClient.put(`/ticket-types/${id}`, data, {
      headers: {
        "user-id": userId,
      },
    });
  },

  /**
   * Delete ticket type
   * DELETE /ticket-types/{id}
   */
  deleteTicketType: (id) => {
    const userId = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id
      : null;

    return axiosClient.delete(`/ticket-types/${id}`, {
      headers: {
        "user-id": userId,
      },
    });
  },

  /**
   * Update remaining tickets
   * PATCH /ticket-types/{id}/remaining?remaining={remaining}
   */
  updateRemaining: (id, remaining) => {
    const userId = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id
      : null;

    return axiosClient.patch(`/ticket-types/${id}/remaining?remaining=${remaining}`, null, {
      headers: {
        "user-id": userId,
      },
    });
  },
};

export default ticketTypeApi;
