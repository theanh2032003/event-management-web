import axiosClient from '../../../app/axios/axiosClient';

const productApi = {
  /**
   * 📦 Lấy danh sách sản phẩm (filter + phân trang)
   * GET /product
   */
  getProducts: async (filters = {}, page = 0, size = 10, sort = 'name,asc') => {
    try {
      // Gộp filter + pageable params gửi lên backend
      const params = {
        ...filters, // supplierIds, categoryIds, keyword, minPrice, maxPrice, isActive,...
        page,
        size,
        sort,
      };

      const response = await axiosClient.get('/product', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ➕ Tạo mới sản phẩm
   * POST /product
   */
  createProduct: async (productData) => {
    try {
      const requestData = {
        name: productData.name,
        categoryId: productData.categoryId,
        code: productData.code !== undefined ? productData.code : null,
        description: productData.description !== undefined ? productData.description : null,
        price: productData.price || 0,
        unit: productData.unit !== undefined ? productData.unit : null,
        images: productData.images || [],
      };

      // axiosClient đã return response.data
      const response = await axiosClient.post('/product', requestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ✏️ Cập nhật sản phẩm
   * PUT /product/{id}
   */
  updateProduct: async (id, productData) => {
    try {
      // axiosClient đã return response.data
      const response = await axiosClient.put(`/product/${id}`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ❌ Xóa sản phẩm
   * DELETE /product/{id}
   */
  deleteProduct: async (id) => {
    try {
      // axiosClient đã return response.data
      const response = await axiosClient.delete(`/product/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔄 Đổi trạng thái hoạt động của sản phẩm
   * PATCH /product/{id}
   * body: { value: true/false }
   */
  changeProductState: async (id, isActive) => {
    try {
      // axiosClient đã return response.data
      const response = await axiosClient.patch(`/product/${id}`, { value: isActive });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 🔍 Lấy chi tiết sản phẩm theo ID
   * GET /product/{id}
   */
  getProductById: async (id) => {
    try {
      // axiosClient đã return response.data
      const response = await axiosClient.get(`/product/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default productApi;
