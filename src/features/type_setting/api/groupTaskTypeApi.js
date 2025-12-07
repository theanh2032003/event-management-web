import axiosClient from '../../../app/axios/axiosClient';

const groupTaskTypeApi = {
  filter: (params, enterpriseId) =>
    axiosClient.get("/group-task-type", {
      params: params,
    }),
};

export default groupTaskTypeApi;
