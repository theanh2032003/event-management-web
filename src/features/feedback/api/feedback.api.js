
import axiosClient from '../../../app/axios/axiosClient';

/**
 * Category API - Quản lý danh mục sản phẩm
 */
const feedbackApi = {
  /**
   * Lấy chi tiết danh mục theo ID
   * GET /category/{id}
   */
  getStatisticFeedback: async (projectId) => {
    try {
      // axiosClient đã return response.data
      const response = await axiosClient.get(`/client/feed_back/statistic`, { params: { eventId : projectId } });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getFeedback: async (projectId, rating, page = 0, size = 10) => {
    try {
        const response = await axiosClient.get(`/client/feed_back`, { params: { eventId: projectId, rating, page, size } });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default feedbackApi; 