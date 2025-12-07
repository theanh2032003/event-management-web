import axiosClient from '../../../app/axios/axiosClient';

const groupTaskStateApi = {
  // Get all groups
  getAll: (enterpriseId) =>
    axiosClient.get("/group-task-state"),

  // Create group
  create: (data, enterpriseId) =>
    axiosClient.post("/group-task-state", data),

  // Update group
  update: (groupId, data, enterpriseId) =>
    axiosClient.put(`/group-task-state/${groupId}`, data),

  // Delete group
  delete: (groupId, enterpriseId) =>
    axiosClient.delete(`/group-task-state/${groupId}`),

  // Get task states of a group
  getTaskStates: (groupId, enterpriseId) =>
    axiosClient.get(`/group-task-state/${groupId}/task-state`),

  // Create task state
  createTaskState: (groupId, data, enterpriseId) =>
    axiosClient.post(`/group-task-state/${groupId}/task-state`, data),

  // Update task state
  updateTaskState: (groupId, taskStateId, data, enterpriseId) =>
    axiosClient.put(`/group-task-state/${groupId}/task-state/${taskStateId}`, data),

  // Delete task state
  deleteTaskState: (groupId, taskStateId, enterpriseId) =>
    axiosClient.delete(`/group-task-state/${groupId}/task-state/${taskStateId}`),

  filter: (params, enterpriseId) =>
    axiosClient.get("/group-task-state", {
      params: params,
    }),
};

export default groupTaskStateApi;
