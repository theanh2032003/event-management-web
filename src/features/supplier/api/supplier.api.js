import axiosClient from '../../../app/axios/axiosClient';


const supplierApi = {
  // Get all suppliers for the current user
  getSuppliers: async (keyword = '', page = 0, size = 10, projectId = null) => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      
      const userId = user?.id || user?._id || user?.userId || null;
      const userIdBackup = localStorage.getItem('userId');
      const ownerId = userId || userIdBackup;

      if (!ownerId) {
        throw new Error('User ID not found. Please login again.');
      }

      const params = {
        keyword: keyword,
        page: page,
        size: size
      };

      // Add projectId if provided
      if (projectId) {
        params.projectId = projectId;
      }

      const response = await axiosClient.get('/api/suppliers', {
        params: params
      });
      
      return response?.data || response;
    } catch (error) {
      throw error;
    }
  },

  createSupplier: async (supplierData) => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      const userId = user?.id || user?._id || user?.userId || null;
      const userIdBackup = localStorage.getItem('userId');
      const finalUserId = userId || userIdBackup;

      if (!finalUserId) {
        throw new Error('User ID not found. Please login again.');
      }

      // Map form data to backend expected format
      const requestData = {
        name: supplierData.name || '',
        phone: supplierData.phone || '',
        email: supplierData.email || '',
        taxCode:  supplierData.taxCode || null,  
        fanpage: supplierData.fanpage || null,
        website: supplierData.website || null,
        description: supplierData.description || null,
        avatar: supplierData.avatar || null
        // Note: ownerId will be taken from header 'user-id' by backend
      };

      const response = await axiosClient.post('/api/suppliers', requestData);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier by ID
  getSupplierById: async (id) => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      const userId = user?.id || user?._id || user?.userId || null;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const response = await axiosClient.get(`/api/suppliers/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      const userId = user?.id || user?._id || user?.userId || null;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const response = await axiosClient.put(`/api/suppliers/${id}`, supplierData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      const userId = user?.id || user?._id || user?.userId || null;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const response = await axiosClient.delete(`/api/suppliers/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default supplierApi;
