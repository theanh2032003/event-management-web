import axiosClient from '../../../app/axios/axiosClient';

/**
 * Notification API Service
 * Handles all notification-related API calls
 */

const notificationApi = {
  /**
   * Get paginated notifications for a user
   * @param {number} userId - User ID
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Number of items per page
   * @returns {Promise} Response with notifications list and pagination info
   * Response structure: { content: [], totalElements, totalPages, pageNumber, pageSize }
   */
  getNotifications: async (userId, page = 0, size = 10) => {
    
    // Check if token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token');
    }
    
    try {
      const response = await axiosClient.get(`/api/notifications/user/${userId}`, {
        params: { page, size }
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Response
   */
  markAsRead: async (notificationId) => {
    console.log(`🔔 Marking notification ${notificationId} as read`);
    
    try {
      const response = await axiosClient.put(`/api/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @param {number} recipientId - Recipient ID (user ID)
   * @param {string} recipientType - Recipient type (default: USER)
   * @returns {Promise} Response
   */
  markAllAsRead: async (recipientId, recipientType = 'USER') => {
    try {
      const response = await axiosClient.put(`/api/notifications/mark-all-read`, null, {
        params: {
          recipientType,
          recipientId
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

 
};

export default notificationApi;

