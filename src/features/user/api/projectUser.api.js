import axiosClient from '../../../app/axios/axiosClient';

/**
 * Role API - Quản lý vai trò và quyền
 */
const projectUserApi = {

  addUsers: async (projectId, userIds) => {
    try {
      const response = await axiosClient.post(`/project/${projectId}/user`, { ids: userIds });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUsers: async (projectId, page, size) => {
    try {
      const response = await axiosClient.get(`/project/${projectId}/user?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  changeUserState: async (projectId, userId, state) => {
    try {
      const response = await axiosClient.post(`/project/${projectId}/user/${userId}/change-state`, { state });
      return response;
    } catch (error) {
      throw error;
    }
  },

  assignRole: async (projectId, assignData) => {
    try {
      const response = await axiosClient.post(`/project/${projectId}/user/${assignData.userId}/assign`, { roleIds: assignData.roleIds });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default projectUserApi;
