import axiosClient from '../../../app/axios/axiosClient';

const statisticApi = {
  /**
   * 📊 Lấy dữ liệu tổng quan (Overall Statistics)
   * GET /statistics/overall
   */
  getOverall: async () => {
    try {
      const response = await axiosClient.get('/statistics/overall');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/overall error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🎫 Lấy dữ liệu bán vé (Ticketing Statistics)
   * GET /statistics/ticketing
   */
  getTicketing: async () => {
    try {
      const response = await axiosClient.get('/statistics/tickets');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/tickets error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 💰 Lấy dữ liệu tài chính (Finance Statistics)
   * GET /statistics/finance
   */
  getFinance: async () => {
    try {
      const response = await axiosClient.get('/statistics/finance');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/finance error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 👥 Lấy dữ liệu người tham gia (Attendees Statistics)
   * GET /statistics/attendees
   */
  getAttendees: async () => {
    try {
      const response = await axiosClient.get('/statistics/checkins');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/checkins error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 💬 Lấy dữ liệu phản hồi (Feedback Statistics)
   * GET /statistics/feedback
   */
  getFeedback: async () => {
    try {
      const response = await axiosClient.get('/statistics/feedback');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/feedback error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🏪 Lấy dữ liệu nhà cung cấp (Suppliers Statistics)
   * GET /statistics/suppliers
   */
  getSuppliers: async () => {
    try {
      const response = await axiosClient.get('/statistics/supplier');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/suppliers error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

    getSuppliersV1: async () => {
    try {
      const response = await axiosClient.get('/statistics/supplier/v1');
      return response?.data || response;
    } catch (error) {
      console.error('[STATISTIC_API] ❌ GET /statistics/suppliers error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },


};

export default statisticApi;