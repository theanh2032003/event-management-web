import axiosClient from '../../../app/axios/axiosClient';


/**
 * Category API - Quản lý danh mục sản phẩm
 */
const categoryApi = {
  /**
   * Lấy danh sách tất cả danh mục
   * GET /category hoặc /product-category
   */
  getCategories: async () => {
    try {
      const response = await axiosClient.get('/category');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết danh mục theo ID
   * GET /category/{id}
   */
  getCategoryById: async (id) => {
    try {
      const response = await axiosClient.get(`/category/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryApi; 