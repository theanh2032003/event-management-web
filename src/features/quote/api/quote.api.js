import axiosClient from '../../../app/axios/axiosClient';

const quoteApi = {
  /**
   * 📦 Lấy danh sách Quote (báo giá)
   * GET /quote
   * Headers: enterprise-id, supplier-id, user-id
   */
  getQuotes: async (filters = {}, page = 0, size = 10) => {
    try {
      // Get IDs from localStorage
      const getUserId = () => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};
        return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
      };

      const getEnterpriseId = () => {
        return localStorage.getItem('enterpriseId');
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
      const enterpriseId = getEnterpriseId();
      const supplierId = getSupplierId();

      const params = {
        ...filters, // state, keyword
        page,
        size,
      };

      // Build headers
      const headers = {};
      if (enterpriseId) {
        headers['enterprise-id'] = enterpriseId;
      }
      if (supplierId) {
        headers['supplier-id'] = supplierId;
      }
      if (userId) {
        headers['user-id'] = userId;
      }

      console.log('[QUOTE_API] 📡 GET /quote with params:', params, 'headers:', headers);
      const response = await axiosClient.get('/quote', { params, headers });
      console.log('[QUOTE_API] ✅ GET /quote response:', response);
      return response?.data || response;
    } catch (error) {
      console.error('[QUOTE_API] ❌ GET /quote error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * ➕ Tạo mới Quote
   * POST /quote
   * Headers: supplier-id, user-id
   */
  createQuote: async (quoteData) => {
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

      if (!supplierId) throw new Error("Supplier ID not found in localStorage.");
      if (!userId) throw new Error("User ID not found in localStorage.");

      const requestData = {
        rfqId: quoteData.rfqId,
        expiredAt: quoteData.expiredAt,
        name: quoteData.name || null,
        files: quoteData.files || [],
        guarantee: quoteData.guarantee || null,
        paymentTerms: quoteData.paymentTerms || null,
        paymentMethod: quoteData.paymentMethod,
        quantity: quoteData.quantity,
        unitPrice: quoteData.unitPrice,
        totalPrice: quoteData.totalPrice,
        tax: quoteData.tax,
        discount: quoteData.discount || null,
        shippingFee: quoteData.shippingFee || null,
        otherFee: quoteData.otherFee || null,
        finalPrice: quoteData.finalPrice || null,
      };

      const headers = {
        'supplier-id': supplierId,
        'user-id': userId,
      };

      console.log('[QUOTE_API] 📡 POST /quote with data:', requestData, 'headers:', headers);
      const response = await axiosClient.post('/quote', requestData, { headers });
      console.log('[QUOTE_API] ✅ POST /quote response:', response);
      return response?.data || response;
    } catch (error) {
      console.error('[QUOTE_API] ❌ POST /quote error:', {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * ✏️ Cập nhật Quote
   * PUT /quote/{id}
   * Headers: supplier-id, user-id
   */
  updateQuote: async (id, quoteData) => {
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

      if (!supplierId) throw new Error("Supplier ID not found in localStorage.");
      if (!userId) throw new Error("User ID not found in localStorage.");

      // Get token from localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

      const requestData = {
        rfqId: quoteData.rfqId,
        expiredAt: quoteData.expiredAt,
        name: quoteData.name || null,
        files: quoteData.files || [],
        guarantee: quoteData.guarantee || null,
        paymentTerms: quoteData.paymentTerms || null,
        paymentMethod: quoteData.paymentMethod,
        quantity: quoteData.quantity,
        unitPrice: quoteData.unitPrice,
        totalPrice: quoteData.totalPrice,
        tax: quoteData.tax,
        discount: quoteData.discount || null,
        shippingFee: quoteData.shippingFee || null,
        otherFee: quoteData.otherFee || null,
        finalPrice: quoteData.finalPrice || null,
      };

      const headers = {
        'supplier-id': supplierId,
        'user-id': userId,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`[QUOTE_API] 📡 PUT /quote/${id} with data:`, requestData, 'headers:', headers);
      const response = await axiosClient.put(`/quote/${id}`, requestData, { headers });
      console.log(`[QUOTE_API] ✅ PUT /quote/${id} response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[QUOTE_API] ❌ PUT /quote/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * ❌ Xóa Quote
   * DELETE /quote/{id}
   * Headers: supplier-id, user-id
   */
  deleteQuote: async (id) => {
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

      if (!supplierId) throw new Error("Supplier ID not found in localStorage.");
      if (!userId) throw new Error("User ID not found in localStorage.");

      const headers = {
        'supplier-id': supplierId,
        'user-id': userId,
      };

      console.log(`[QUOTE_API] 📡 DELETE /quote/${id} with headers:`, headers);
      const response = await axiosClient.delete(`/quote/${id}`, { headers });
      console.log(`[QUOTE_API] ✅ DELETE /quote/${id} response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[QUOTE_API] ❌ DELETE /quote/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🔍 Lấy chi tiết Quote theo ID
   * GET /quote/{id}
   * Headers: enterprise-id, supplier-id, user-id
   */
  getQuoteById: async (id) => {
    try {
      const getUserId = () => {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : {};
        return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
      };

      const getEnterpriseId = () => {
        return localStorage.getItem('enterpriseId');
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
      const enterpriseId = getEnterpriseId();
      const supplierId = getSupplierId();

      const headers = {};
      if (enterpriseId) {
        headers['enterprise-id'] = enterpriseId;
      }
      if (supplierId) {
        headers['supplier-id'] = supplierId;
      }
      if (userId) {
        headers['user-id'] = userId;
      }

      console.log(`[QUOTE_API] 📡 GET /quote/${id} with headers:`, headers);
      const response = await axiosClient.get(`/quote/${id}`, { headers });
      console.log(`[QUOTE_API] ✅ GET /quote/${id} response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[QUOTE_API] ❌ GET /quote/${id} error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🔁 Supplier thay đổi trạng thái Quote
   * PATCH /quote/supplier/{id}/state
   * Headers: supplier-id, user-id
   */
  supplierChangeState: async (id, stateDto) => {
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

      if (!supplierId) throw new Error("Supplier ID not found in localStorage.");
      if (!userId) throw new Error("User ID not found in localStorage.");

      const headers = {
        'supplier-id': supplierId,
        'user-id': userId,
      };

      console.log(`[QUOTE_API] 📡 PATCH /quote/supplier/${id}/state with data:`, stateDto, 'headers:', headers);
      const response = await axiosClient.patch(`/quote/supplier/${id}/state`, stateDto, { headers });
      console.log(`[QUOTE_API] ✅ PATCH /quote/supplier/${id}/state response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[QUOTE_API] ❌ PATCH /quote/supplier/${id}/state error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },

  /**
   * 🔁 Enterprise thay đổi trạng thái Quote
   * PATCH /quote/enterprise/{id}/state
   */
  enterpriseChangeState: async (id, stateDto) => {
    try {
      console.log(`[QUOTE_API] 📡 PATCH /quote/enterprise/${id}/state with data:`, stateDto);
      const response = await axiosClient.patch(`/quote/enterprise/${id}/state`, stateDto);
      console.log(`[QUOTE_API] ✅ PATCH /quote/enterprise/${id}/state response:`, response);
      return response?.data || response;
    } catch (error) {
      console.error(`[QUOTE_API] ❌ PATCH /quote/enterprise/${id}/state error:`, {
        message: error?.response?.data?.message || error.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    }
  },
};

export default quoteApi;
