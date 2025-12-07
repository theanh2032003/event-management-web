import axiosClient from "../../../app/axios/axiosClient";

const projectApi = {
  /**
   * Get project details including task states and types
   * @param {number} projectId - The project ID
   * @param {string} enterpriseId - The enterprise ID (optional, will fallback to localStorage)
   * @returns {Promise} Project details with groupTaskState.states and groupTaskType.types
   */
  getById: (projectId) => {
    const url = `/project/${projectId}`;
    const finalEnterpriseId = localStorage.getItem("enterpriseId");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    return axiosClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "enterprise-id": finalEnterpriseId,
        "user-id": userId,
      },
    });
  },

  /**
   * Get list of projects for an enterprise
   * @param {string} enterpriseId - The enterprise ID (optional, will fallback to localStorage)
   * @returns {Promise} List of projects
   */
  getProjectsByEnterprise: (keyword) => {
    const url = `/project`;
    return axiosClient.get(url, {
      params: {
        ...(keyword && { keyword }),
      },
    });
  },

  /**
   * Get users in a project
   * @param {number} projectId - The project ID
   * @returns {Promise} List of users in the project
   */
  getUsers: (projectId) => {
    const url = `/project/${projectId}/user`;
    return axiosClient.get(url);
  },
};

export default projectApi;
