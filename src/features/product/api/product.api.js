import axiosClient from '../../../app/axios/axiosClient';

const productApi = {
  /**
   * 📦 Lấy danh sách sản phẩm (filter + phân trang)
   * GET /product
   */
  getProducts: async (filters = {}, page = 0, size = 10, sort = null) => {
    try {
      console.log('🔍 Product API - filters:', filters);
      console.log('📄 Product API - pagination:', { page, size, sort });

      // Build params object according to API documentation
      const paramsFilter = {};
      
      // Add filter fields
      if (filters.keyword) {
        paramsFilter.keyword = filters.keyword;
      }
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        paramsFilter.categoryIds = filters.categoryIds;
      }
      if (filters.supplierIds && filters.supplierIds.length > 0) {
        paramsFilter.supplierIds = filters.supplierIds;
      }
      if (filters.isActive !== undefined) {
        paramsFilter.isActive = filters.isActive;
      }
      if (filters.minPrice !== undefined) {
        paramsFilter.minPrice = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        paramsFilter.maxPrice = filters.maxPrice;
      }

      // Build pageable object
      const pageable = {
        page: page,
        size: size,
      };
      
      // Add sort if provided
      if (sort) {
        pageable.sort = [sort];
      }

      // Flatten all params into single object (backend may not expect nested objects)
      const flatParams = {
        ...paramsFilter,
        page: pageable.page,
        size: pageable.size,
      };
      
      if (sort) {
        flatParams.sort = sort;
      }

      console.log('📤 Product API - filter object:', paramsFilter);
      console.log('📤 Product API - pageable object:', pageable);
      console.log('📤 Product API - flattened params:', flatParams);

      const response = await axiosClient.get('/product', { params: flatParams });
      
      console.log('📥 Product API - response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Product API - error:', error);
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
