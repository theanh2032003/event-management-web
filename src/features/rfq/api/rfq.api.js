import axiosClient from '../../../app/axios/axiosClient';

const rfqApi = {
  /**
   * 📦 Lấy danh sách RFQ (Request for Quotation)
   * GET /rfq
   * Headers: enterprise-id, supplier-id, user-id
   */
  getRfqs: async (filters = {}, page = 0, size = 10) => {
    try {

      const params = {
        ...filters, // projectId, keyword
        page,
        size,
      };

      const response = await axiosClient.get('/rfq', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ➕ Tạo mới RFQ (Request for Quotation)
   * POST /rfq
   * @param {Object} rfqData - { name, productId, quantity, note, files, expiredAt }
   */
  createRfq: async (rfqData) => {
    try {
      const requestData = {
        name: rfqData.name,
        productId: rfqData.productId,
        quantity: rfqData.quantity,
        note: rfqData.note || '',
        projectId: rfqData.projectId,
        files: rfqData.files || [],
        expiredAt: rfqData.expiredAt,
        // state is set by backend (default: DRAFT)
      };

      const response = await axiosClient.post('/rfq', requestData);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ✏️ Cập nhật RFQ
   * PUT /rfq/{id}
   */
  updateRfq: async (id, rfqData) => {
    try {
      const requestData = {
        name: rfqData.name,
        productId: rfqData.productId,
        projectId: rfqData.projectId,
        quantity: rfqData.quantity,
        note: rfqData.note || '',
        files: rfqData.files || [],
        expiredAt: rfqData.expiredAt,
      };

      const response = await axiosClient.put(`/rfq/${id}`, requestData);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ❌ Xóa RFQ
   * DELETE /rfq/{id}
   */
  deleteRfq: async (id) => {
    try {
      const response = await axiosClient.delete(`/rfq/${id}`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔍 Lấy chi tiết RFQ theo ID
   * GET /rfq/{id}
   * Headers: enterprise-id, supplier-id, user-id
   */
  getRfqById: async (id) => {
    try {
      const response = await axiosClient.get(`/rfq/${id}`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

    getRfqByIdSupplier: async (id) => {
    try {
      const response = await axiosClient.get(`/rfq/${id}/supplier`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔁 Supplier thay đổi trạng thái RFQ
   * PATCH /rfq/supplier/{id}/state
   */
  supplierChangeState: async (id, stateDto) => {
    try {
      const response = await axiosClient.patch(`/rfq/supplier/${id}/state`, stateDto);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔁 Enterprise thay đổi trạng thái RFQ
   * PATCH /rfq/enterprise/{id}/state
   */
  enterpriseChangeState: async (id, stateDto) => {
    try {
      const response = await axiosClient.patch(`/rfq/${id}`, stateDto);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },
};

export default rfqApi;
