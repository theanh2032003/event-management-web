import { useFetchWithRetry } from "./useFetchWithRetry";
import enterpriseApi from "../api/enterpriseApi";
import projectApi from "../api/projectApi";

/**
 * Custom hook to fetch all data needed for Task form
 * @param {number} projectId - The project ID
 * @param {string} enterpriseId - The enterprise ID
 * @returns {Object} { users, taskStates, taskTypes, loading, error }
 */
export const useTaskFormData = (projectId, enterpriseId) => {
  // Fetch enterprise users
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useFetchWithRetry(() => enterpriseApi.getEnterpriseUsers(enterpriseId), [enterpriseId]);

  // Fetch project details (includes task states and types)
  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useFetchWithRetry(() => projectApi.getById(projectId, enterpriseId), [projectId, enterpriseId]);

  // Extract task types from project data, task states are now fixed constants
  const taskTypes = projectData?.groupTaskType?.types || [];
  const users = usersData || [];

  const loading = usersLoading || projectLoading;
  const error = usersError || projectError;

  return {
    users,
    taskStates,
    taskTypes,
    loading,
    error,
  };
};
