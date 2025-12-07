import axiosClient from '../../../app/axios/axiosClient';

const paymentApprovalApi = {
  /**
   * 📦 Lấy danh sách Payment Approval
   * GET /payment-approval
   * Filter: { projectId?, states: [], type, keyword, supplierIds: [] }
   * States: DRAFT, PENDING_LV1, APPROVED_LV1, REJECTED_LV1, PENDING_LV2, APPROVED_ALL, REJECTED_LV2
   * Type: QUOTE, TASK
   */
  getPaymentApprovals: async (projectId, filters = {}, page = 0, size = 10) => {
    try {
      // Build the main params object with filters
      const filterParams = {};
      
      // Add projectId if provided
      if (projectId) {
        filterParams.projectId = projectId;
      }

      // Add optional filters
      if (filters.states && Array.isArray(filters.states) && filters.states.length > 0) {
        filterParams.states = filters.states; // Send as array, not comma-separated
      }
      if (filters.type) {
        filterParams.type = filters.type;
      }
      if (filters.keyword) {
        filterParams.keyword = filters.keyword;
      }
      if (filters.supplierIds && Array.isArray(filters.supplierIds) && filters.supplierIds.length > 0) {
        filterParams.supplierIds = filters.supplierIds; // Send as array, not comma-separated
      }

      // Build the pageable object
      const pageableParams = {
        page,
        size
      };

      // Combine both objects - axios will serialize them properly
      const requestParams = {
        ...filterParams,
        ...pageableParams,
      };

      console.log('[PAYMENT_APPROVAL_API] 📡 GET /payment-approval with params:', requestParams);
      const response = await axiosClient.get(`/payment-approval`, { params: requestParams });
      console.log('[PAYMENT_APPROVAL_API] ✅ GET /payment-approval response:', response);
      // axiosClient already returns response.data from interceptor
      return response;
    } catch (error) {
      console.error('[PAYMENT_APPROVAL_API] ❌ GET /payment-approval error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data,
        requestParams: { projectId, filters, page, size }
      });
      throw error;
    }
  },

  /**
   * ➕ Tạo mới Payment Approval cho 1 project
   * POST /project/{projectId}/payment-approval
   * Payload: { name, quoteId?, taskId?, type, amount, purpose? }
   * Type: QUOTE, TASK
   */
  createPaymentApproval: async (projectId, data) => {
    try {
      const requestData = {
        name: data.name,
        quoteId: data.quoteId || null,
        taskId: data.taskId || null,
        type: data.type || "QUOTE",
        amount: parseFloat(data.amount),
        purpose: data.purpose || null,
      };

      console.log('[PAYMENT_APPROVAL_API] 📡 POST /payment-approval with data:', requestData);
      const response = await axiosClient.post(`/payment-approval`, requestData);
      console.log('[PAYMENT_APPROVAL_API] ✅ POST /payment-approval response:', response);
      return response;
    } catch (error) {
      console.error('[PAYMENT_APPROVAL_API] ❌ POST /payment-approval error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data,
        requestData
      });
      throw error;
    }
  },

  /**
   * ✏️ Cập nhật Payment Approval
   * PUT /project/{projectId}/payment-approval/{id}
   * Payload: { name, quoteId?, taskId?, type, amount, purpose? }
   * Type: QUOTE, TASK
   */
  updatePaymentApproval: async (projectId, id, data) => {
    try {
      const requestData = {
        name: data.name,
        quoteId: data.quoteId || null,
        taskId: data.taskId || null,
        type: data.type || "QUOTE",
        amount: parseFloat(data.amount),
        purpose: data.purpose || null,
      };

      console.log(`[PAYMENT_APPROVAL_API] 📡 PUT /payment-approval/${id} with data:`, requestData);
      const response = await axiosClient.put(`/payment-approval/${id}`, requestData);
      console.log(`[PAYMENT_APPROVAL_API] ✅ PUT /payment-approval/${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_APPROVAL_API] ❌ PUT /payment-approval/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data,
        requestData
      });
      throw error;
    }
  },

  /**
   * 🟢 Duyệt cấp 1 (Level 1 Approval)
   * DELETE /project/{projectId}/payment-approval/{id}/lv1
   */
  approvalLv1: async (id, approvalData) => {
    try {
      console.log(`[PAYMENT_APPROVAL_API] 📡 DELETE /payment-approval/${id}/lv1 with data:`, approvalData);
      const response = await axiosClient.delete(`/payment-approval/${id}/lv1`, {
        data: approvalData, // { state, note }
      });
      console.log(`[PAYMENT_APPROVAL_API] ✅ DELETE /payment-approval/${id}/lv1 response:`, response);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_APPROVAL_API] ❌ DELETE /payment-approval/${id}/lv1 error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data,
        approvalData
      });
      throw error;
    }
  },

  /**
   * 🔵 Duyệt cấp 2 (Level 2 Approval)
   * PATCH /project/{projectId}/payment-approval/{id}/lv2
   */
  approvalLv2: async (id, approvalData) => {
    try {
      console.log(`[PAYMENT_APPROVAL_API] 📡 PATCH /payment-approval/${id}/lv2 with data:`, approvalData);
      const response = await axiosClient.patch(`/payment-approval/${id}/lv2`, approvalData);
      console.log(`[PAYMENT_APPROVAL_API] ✅ PATCH /payment-approval/${id}/lv2 response:`, response);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_APPROVAL_API] ❌ PATCH /payment-approval/${id}/lv2 error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data,
        approvalData
      });
      throw error;
    }
  },

    submit: async (id) => {
    try {
      const response = await axiosClient.patch(`/payment-approval/${id}/submit`);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_APPROVAL_API] ❌ PATCH /payment-approval/${id}/lv2 error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data,
        approvalData
      });
      throw error;
    }
  },

  /**
   * 🔍 Lấy chi tiết Payment Approval theo ID
   * GET /project/{projectId}/payment-approval/{id}
   */
  getPaymentApprovalById: async (id) => {
    try {
      console.log(`[PAYMENT_APPROVAL_API] 📡 GET /payment-approval/${id}`);
      const response = await axiosClient.get(`/payment-approval/${id}`);
      console.log(`[PAYMENT_APPROVAL_API] ✅ GET /payment-approval/${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_APPROVAL_API] ❌ GET /payment-approval/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🗑️ Xoá Payment Approval
   * DELETE /payment-approval/{id}
   */
  deletePaymentApproval: async (id) => {
    try {
      console.log(`[PAYMENT_APPROVAL_API] 📡 DELETE /payment-approval/${id}`);
      const response = await axiosClient.delete(`/payment-approval/${id}`);
      console.log(`[PAYMENT_APPROVAL_API] ✅ DELETE /payment-approval/${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_APPROVAL_API] ❌ DELETE /payment-approval/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },
};

export default paymentApprovalApi;
