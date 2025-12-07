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
      // Get IDs from localStorage
      const getUserId = () => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};
        return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
      };

      const getSupplierId = () => {
        const currentWorkspace = localStorage.getItem('currentWorkspace');
        if (currentWorkspace) {
          try {
            const workspace = JSON.parse(currentWorkspace);
            if (workspace.type === 'supplier' && workspace.id) {
              return workspace.id.toString();
            }
          } catch (e) {
            console.error('Error parsing currentWorkspace:', e);
          }
        }
        return null;
      };

      const userId = getUserId();
      const supplierId = getSupplierId();

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

      // Build headers
      const headers = {};
      
      if (filters.enterpriseId) {
        headers['enterprise-id'] = filters.enterpriseId;
      }

      if (supplierId) {
        headers['supplier-id'] = supplierId;
      }

      if (userId) {
        headers['user-id'] = userId;
      }

      console.log('[CONTRACT_API] 📡 GET /contract with params:', params, 'headers:', headers);
      const response = await axiosClient.get('/contract', { 
        params,
        headers,
      });
      console.log('[CONTRACT_API] ✅ GET /contract response:', response);
      
      return response?.data || response;
    } catch (error) {
      console.error('[CONTRACT_API] ❌ GET /contract error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
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
      const getUserId = () => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};
        return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
      };

      const userId = getUserId();

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

      const headers = {};
      if (enterpriseId) {
        headers['enterprise-id'] = enterpriseId;
      }
      if (userId) {
        headers['user-id'] = userId;
      }

      console.log('[CONTRACT_API] 📡 POST /contract with data:', requestData, 'headers:', headers);
      const response = await axiosClient.post('/contract', requestData, { headers });
      console.log('[CONTRACT_API] ✅ POST /contract response:', response);
      return response?.data || response;
    } catch (error) {
      console.error('[CONTRACT_API] ❌ POST /contract error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 📤 Submit hợp đồng
   * PATCH /contract/{id}/submit
   * Headers: enterprise-id, user-id
   * Path param: id (contractId)
   */
  submitContract: async (contractId, enterpriseId) => {
    try {
      const getUserId = () => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};
        return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
      };

      const userId = getUserId();

      const headers = {};
      if (enterpriseId) {
        headers['enterprise-id'] = enterpriseId;
      }
      if (userId) {
        headers['user-id'] = userId;
      }

      console.log(`[CONTRACT_API] 📡 PATCH /contract/${contractId}/submit with headers:`, headers);
      const response = await axiosClient.patch(`/contract/${contractId}/submit`, {}, { headers });
      console.log(`[CONTRACT_API] ✅ PATCH /contract/${contractId}/submit response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[CONTRACT_API] ❌ PATCH /contract/${contractId}/submit error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
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

      console.log(`[CONTRACT_API] 📡 PUT /contract/${id} with data:`, requestData);
      const response = await axiosClient.put(`/contract/${id}`, requestData);
      console.log(`[CONTRACT_API] ✅ PUT /contract/${id} response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[CONTRACT_API] ❌ PUT /contract/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * ❌ Xóa hợp đồng
   * DELETE /contract/{id}
   */
  deleteContract: async (id) => {
    try {
      console.log(`[CONTRACT_API] 📡 DELETE /contract/${id}`);
      const response = await axiosClient.delete(`/contract/${id}`);
      console.log(`[CONTRACT_API] ✅ DELETE /contract/${id} response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[CONTRACT_API] ❌ DELETE /contract/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🔍 Lấy chi tiết hợp đồng theo ID
   * GET /contract/{id}
   */
  getContractById: async (id) => {
    try {
      console.log(`[CONTRACT_API] 📡 GET /contract/${id}`);
      const response = await axiosClient.get(`/contract/${id}`);
      console.log(`[CONTRACT_API] ✅ GET /contract/${id} response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[CONTRACT_API] ❌ GET /contract/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
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
      console.error('❌ Error updating contract status:', error?.response?.data || error.message);
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
      const getUserId = () => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};
        return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
      };

      const getSupplierId = () => {
        const currentWorkspace = localStorage.getItem('currentWorkspace');
        if (currentWorkspace) {
          try {
            const workspace = JSON.parse(currentWorkspace);
            if (workspace.type === 'supplier' && workspace.id) {
              return workspace.id.toString();
            }
          } catch (e) {
            console.error('Error parsing currentWorkspace:', e);
          }
        }
        return null;
      };

      const userId = getUserId();
      const supplierId = getSupplierId();

      const requestData = {
        state: data.state,
      };

      const headers = {};
      if (supplierId) {
        headers['supplier-id'] = supplierId;
      }
      if (userId) {
        headers['user-id'] = userId;
      }

      console.log(`[CONTRACT_API] 📡 PATCH /contract/${id}/state with data:`, requestData, 'headers:', headers);
      const response = await axiosClient.patch(`/contract/${id}/state`, requestData, { headers });
      console.log(`[CONTRACT_API] ✅ PATCH /contract/${id}/state response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[CONTRACT_API] ❌ PATCH /contract/${id}/state error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },
};

export default contractApi;
