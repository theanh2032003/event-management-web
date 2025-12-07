import axiosClient from '../../../app/axios/axiosClient';

/**
 * Location API - Quản lý địa điểm
 */
const locationApi = {
  /**
   * Lấy danh sách địa điểm
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @returns {Promise} Danh sách địa điểm
   */
  getLocations: async (enterpriseId) => {
    try {
      const response = await axiosClient.get(`/location`);
      return response;
    } catch (error) {
      throw error;
    }
  },


  /**
   * Tạo địa điểm mới
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {object} locationData - Dữ liệu địa điểm
   * @returns {Promise} Địa điểm đã tạo
   */
  createLocation: async (locationData) => {
    try {
      const response = await axiosClient.post(`/location/enterprise`, locationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật địa điểm
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} locationId - ID của địa điểm
   * @param {object} locationData - Dữ liệu địa điểm
   * @returns {Promise} Địa điểm đã cập nhật
   */
  updateLocation: async (locationId, locationData) => {
    try {
      const response = await axiosClient.put(`/location/${locationId}/enterprise`, locationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

    /**
   * Cập nhật địa điểm
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} locationId - ID của địa điểm
   * @param {object} locationData - Dữ liệu địa điểm
   * @returns {Promise} Địa điểm đã cập nhật
   */
  changeAvailableEnterprise: async (locationId, available) => {
    try {
      const response = await axiosClient.patch(`/location/${locationId}/availability/enterprise?available=${available}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa địa điểm
   * @param {string} locationId - ID của địa điểm
   * @returns {Promise}
   */
  deleteLocation: async (locationId) => {
    try {
      const response = await axiosClient.delete(`/location/${locationId}/enterprise`);
      return response;
    } catch (error) {
      throw error;
    }
  },

    createLocationSupplier: async (locationData) => {
    try {
      const response = await axiosClient.post(`/location/supplier`, locationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật địa điểm
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} locationId - ID của địa điểm
   * @param {object} locationData - Dữ liệu địa điểm
   * @returns {Promise} Địa điểm đã cập nhật
   */
  updateLocationSupplier: async (locationId, locationData) => {
    try {
      const response = await axiosClient.put(`/location/${locationId}/supplier`, locationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

    /**
   * Cập nhật địa điểm
   * @param {string} enterpriseId - ID của doanh nghiệp
   * @param {string} locationId - ID của địa điểm
   * @param {object} locationData - Dữ liệu địa điểm
   * @returns {Promise} Địa điểm đã cập nhật
   */
  changeAvailableSupplier: async (locationId, available) => {
    try {
      const response = await axiosClient.patch(`/location/${locationId}/availability/supplier?available=${available}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa địa điểm
   * @param {string} locationId - ID của địa điểm
   * @returns {Promise}
   */
  deleteLocationSupplier: async (locationId) => {
    try {
      const response = await axiosClient.delete(`/location/${locationId}/supplier`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết địa điểm
  getLocationDetails: (locationId) => {
    return axiosClient.get(`/location/${locationId}`);
  },

  // Các phương thức API khác liên quan đến địa điểm có thể được thêm vào đây

  /**
   * Tạo địa điểm con
   * @param {string} locationId - ID của địa điểm cha
   * @param {object} subLocationData - Dữ liệu địa điểm con
   * @returns {Promise} Địa điểm con đã tạo
   */
  createSubLocation: async (locationId, subLocationData) => {
    try {
      const response = await axiosClient.post(`/location-sub`, subLocationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật địa điểm con
   * @param {string} subLocationId - ID của địa điểm con
   * @param {object} subLocationData - Dữ liệu địa điểm con
   * @returns {Promise} Địa điểm con đã cập nhật
   */
  updateSubLocation: async (subLocationId, subLocationData) => {
    try {
      const response = await axiosClient.put(`/location-sub/${subLocationId}`, subLocationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa địa điểm con
   * @param {string} subLocationId - ID của địa điểm con
   * @returns {Promise}
   */
  deleteSubLocation: async (subLocationId) => {
    try {
      const response = await axiosClient.delete(`/location-sub/${subLocationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Lấy chi tiết địa điểm con
   * @param {string} subLocationId - ID của địa điểm con
   * @returns {Promise} Chi tiết địa điểm con
   */
  detailSubLocation: async (subLocationId) => {
    try {
      const response = await axiosClient.get(`/location-sub/${subLocationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lọc địa điểm con theo địa điểm cha
   * @param {string} locationId - ID của địa điểm cha
   * @returns {Promise} Danh sách địa điểm con
   */
  filterSublocationByLocation: async (locationId) => {
    try {
      const response = await axiosClient.get(`/location-sub?locationId=${locationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

};

export default locationApi;
