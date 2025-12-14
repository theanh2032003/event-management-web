import axiosClient from '../../../app/axios/axiosClient';

const contractApi = {
  /**
   * 📦 Lấy danh sách hợp đồng (Contract)
   * GET /contract
   * Headers: enterprise-id, supplier-id, user-id
   * Query params: owner, projectId, state, keyword, pageable (page, size, sort)
   */
  getContracts: async (filters = {}, page = 0, size = 10, sort = 'id,desc') => {
    try {


      // Build query params
      const params = {
        page,
        size,
        sort,
      };

      // Add filters
      if (filters.owner !== undefined) {
        params.owner = filters.owner;
      } else {
        params.owner = true; // Default to true
      }

      if (filters.projectId) {
        params.projectId = filters.projectId;
      }

      if (filters.state) {
        params.state = filters.state;
      }

      if (filters.keyword) {
        params.keyword = filters.keyword;
      }

      const response = await axiosClient.get('/contract', { 
        params,
      });
      
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ➕ Tạo mới hợp đồng
   * POST /contract
   * Headers: enterprise-id, user-id
   * Body: { name, paymentApprovalId, startDate, endDate, totalValue, currency, paymentTerms, guaranteeTerms, terminationTerms, notes, signedDate, signedByEnterprise, signedBySupplier, attachments }
   */
  createContract: async (contractData, enterpriseId) => {
    try {

      const requestData = {
        name: contractData.name,
        paymentApprovalId: contractData.paymentApprovalId || null,
        startDate: contractData.startDate, // ISO string
        endDate: contractData.endDate, // ISO string
        totalValue: parseFloat(contractData.totalValue) || 0,
        currency: contractData.currency || 'VND',
        paymentTerms: contractData.paymentTerms || null,
        guaranteeTerms: contractData.guaranteeTerms || null,
        terminationTerms: contractData.terminationTerms || null,
        notes: contractData.notes || null,
        signedDate: contractData.signedDate || null, // ISO string
        signedByEnterprise: contractData.signedByEnterprise || null,
        signedBySupplier: contractData.signedBySupplier || null,
        attachments: contractData.attachments || [],
      };

      const response = await axiosClient.post('/contract', requestData);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 📤 Submit hợp đồng
   * PATCH /contract/{id}/submit
   * Headers: enterprise-id, user-id
   * Path param: id (contractId)
   */
  submitContract: async (contractId) => {
    try {

      const response = await axiosClient.patch(`/contract/${contractId}/submit`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ✏️ Cập nhật hợp đồng
   * PUT /contract/{id}
   */
  updateContract: async (id, contractData) => {
    try {
      const requestData = {
        name: contractData.name,
        paymentApprovalId: contractData.paymentApprovalId,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        totalValue: contractData.totalValue,
        currency: contractData.currency,
        paymentTerms: contractData.paymentTerms,
        guaranteeTerms: contractData.guaranteeTerms,
        terminationTerms: contractData.terminationTerms,
        notes: contractData.notes,
        attachments: contractData.attachments || [],
      };

      const response = await axiosClient.put(`/contract/${id}`, requestData);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ❌ Xóa hợp đồng
   * DELETE /contract/{id}
   */
  deleteContract: async (id) => {
    try {
      const response = await axiosClient.delete(`/contract/${id}`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔍 Lấy chi tiết hợp đồng theo ID
   * GET /contract/{id}
   */
  getContractById: async (id) => {
    try {
      const response = await axiosClient.get(`/contract/${id}`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 📝 Cập nhật trạng thái hợp đồng (deprecated - use submitContract)
   * PATCH /contract/{id}/status
   */
  updateContractStatus: async (id, data) => {
    try {
      const requestData = {
        status: data.status,
      };

      const response = await axiosClient.patch(`/contract/${id}/status`, requestData);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 📝 Cập nhật trạng thái hợp đồng
   * PATCH /contract/{id}/state
   * Body: { state }
   */
  updateContractState: async (id, data) => {
    try {

      const requestData = {
        state: data.state,
      };

      const response = await axiosClient.patch(`/contract/${id}/change-state`, requestData);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },
};

export default contractApi;
