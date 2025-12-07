import axiosClient from "../../../app/axios/axiosClient";

const activityLogApi = {
  filter: (projectId, types, page, size) => {
    const url = `/activity-log?projectId=${projectId}&types=${types}&page=${page}&size=${size}`;
    return axiosClient.get(url);
  },

  /**
   * 📋 Lấy danh sách Activity Logs
   * GET /activity-log
   */
  getActivityLogs: async (filters = {}, page = 0, size = 10, types = ['STAGE', 'TASK']) => {
    try {
      const params = {
        ...filters,
        types: types.join(','),
        page,
        size,
      };
      const response = await axiosClient.get('/activity-log', { params });
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },
};

export default activityLogApi;

