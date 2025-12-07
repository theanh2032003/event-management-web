import axiosClient from '../../../app/axios/axiosClient';

const enterpriseApi = {
  // Get all enterprises - Lấy tất cả doanh nghiệp không cần params và không cần header
  getEnterprises: async (keyword = '', page = 0, size = 10) => {
    try {
      const response = await axiosClient.get('/enterprise');
      
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Create a new enterprise
  createEnterprise: async (enterpriseData) => {
    try {

      // Map form data to backend expected format
      const requestData = {
        name: enterpriseData.name || '',
        phone: enterpriseData.phone || '',
        email: enterpriseData.email || '',
        description: enterpriseData.description || null,
        fanpage: enterpriseData.fanpage || null,
        website: enterpriseData.website || null,
        avatar: enterpriseData.avatar || null
      };


      const response = await axiosClient.post('/enterprise', requestData);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get enterprise by ID
  getEnterpriseById: async (id) => {
    try {
      const response = await axiosClient.get(`/enterprise/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update enterprise
  updateEnterprise: async (id, enterpriseData) => {
    try {
      const response = await axiosClient.put(`/enterprise`, enterpriseData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all users in an enterprise
   * @param {string} enterpriseId - The enterprise ID
   * @returns {Promise} List of users with id, email, name, avatar, phone, state, isOwner
   */
  getEnterpriseUsers: async (enterpriseId) => {
    try {
      const response = await axiosClient.get("/enterprise/user");
      
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default enterpriseApi;
