import { useFetchWithRetry } from "./useFetchWithRetry";
import stageApi from "../../features/stage/api/stage.api";
import projectApi from "../../features/project/api/project.api";

/**
 * Custom hook to fetch all data needed for Task form within a Stage
 * @param {number} projectId - The project ID
 * @param {number} stageId - The stage ID
 * @param {string} enterpriseId - The enterprise ID
 * @returns {Object} { users, taskStates, taskTypes, loading, error }
 */
export const useStageTaskFormData = (projectId, stageId, enterpriseId) => {
  // Fetch stage users
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useFetchWithRetry(
    () => stageId ? stageApi.getUsers(projectId, stageId) : Promise.resolve([]),
    [projectId, stageId]
  );

  // Fetch project details (includes task states and types)
  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useFetchWithRetry(() => projectApi.getById(projectId, enterpriseId), [projectId, enterpriseId]);

  // Extract task states and types from project data
  const taskStates = projectData?.groupTaskState?.states || [];
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
