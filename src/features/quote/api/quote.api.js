import axiosClient from '../../../app/axios/axiosClient';

const quoteApi = {
  /**
   * 📦 Lấy danh sách Quote (báo giá)
   * GET /quote
   * Headers: enterprise-id, supplier-id, user-id
   */
  getQuotes: async (filters = {}, page = 0, size = 10) => {
    try {

      const response = await axiosClient.get('/quote', { params: { ...filters, page, size } });
      return response?.data || response;
    } catch (error) {
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

      const response = await axiosClient.post('/quote', requestData);
      return response?.data || response;
    } catch (error) {
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

      const response = await axiosClient.put(`/quote/${id}`, requestData);
      return response?.data || response;
    } catch (error) {
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
      const response = await axiosClient.delete(`/quote/${id}`);
      return response?.data || response;
    } catch (error) {
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

      const response = await axiosClient.get(`/quote/${id}`);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

    getQuoteByIdEnterprise: async (id) => {
    try {

      const response = await axiosClient.get(`/quote/${id}/enterprise`);
      return response?.data || response;
    } catch (error) {
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

      const response = await axiosClient.patch(`/quote/supplier/${id}/state`, stateDto);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔁 Enterprise thay đổi trạng thái Quote
   * PATCH /quote/enterprise/{id}/state
   */
  enterpriseChangeState: async (id, stateDto) => {
    try {
      const response = await axiosClient.patch(`/quote/enterprise/${id}/state`, stateDto);
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },
};

export default quoteApi;
