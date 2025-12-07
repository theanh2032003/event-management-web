import axiosClient from '../../../app/axios/axiosClient';

/**
 * Task API - Quản lý công việc trong giai đoạn
 * Base URL: /task
 */
const taskApi = {
  /**
   * Lấy danh sách công việc
   * GET /task
   * @param {object} queryParams - Query params
   * @param {number} queryParams.projectId - ID của dự án
   * @param {number} queryParams.stageId - ID của giai đoạn
   * @param {number} queryParams.typeId - ID loại công việc (optional)
   * @param {number} queryParams.stateId - ID trạng thái (optional)
   * @param {string} queryParams.keyword - Từ khóa tìm kiếm (optional)
   * @param {number} queryParams.page - Số trang (optional, default: 0)
   * @param {number} queryParams.size - Kích thước trang (optional, default: 10)
   * @param {string[]} queryParams.sort - Sắp xếp (optional)
   * @returns {Promise} Danh sách công việc
   */
  getAll: (queryParams = {}) => {
    const url = `/task`;
    // Build params object with all query parameters
    const params = {
      projectId: queryParams.projectId,
      stageId: queryParams.stageId,
      ...(queryParams.typeId !== undefined && { typeId: queryParams.typeId }),
      ...(queryParams.stateId !== undefined && { stateId: queryParams.stateId }),
      ...(queryParams.keyword && { keyword: queryParams.keyword }),
      ...(queryParams.page !== undefined && { page: queryParams.page }),
      ...(queryParams.size !== undefined && { size: queryParams.size }),
      ...(queryParams.sort && { sort: queryParams.sort }),
    };
    
    return axiosClient.get(url);
  },

  /**
   * Lấy chi tiết một công việc
   * GET /task/{id}
   * @param {number} taskId - ID của công việc
   * @returns {Promise} Chi tiết công việc
   */
  getById: (taskId) => {
    const url = `/task/${taskId}`;
    const enterpriseId = localStorage.getItem("enterpriseId");
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    return axiosClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "enterprise-id": enterpriseId
      }
    });
  },

  /**
   * Tạo công việc mới
   * POST /task
   * @param {object} data - Dữ liệu công việc (name, description, images, supporterIds, testerIds, implementerIds, stateId, typeId, stageId)
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Công việc đã tạo
   */
  create: (data, enterpriseId = null, userId = null) => {
    const url = `/task`;

    return axiosClient.post(url, data);
  },

  /**
   * Cập nhật công việc
   * PUT /task/{id}
   * @param {number} taskId - ID của công việc
   * @param {object} data - Dữ liệu công việc (name, description, images, supporterIds, testerIds, implementerIds, stateId, typeId)
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Công việc đã cập nhật
   */
  update: (taskId, data, enterpriseId = null, userId = null) => {
    const url = `/task/${taskId}`;

    console.log("🔧 UPDATE Task - Data Fields:", {
      name: data.name,
      description: data.description,
      stateId: data.stateId,
      typeId: data.typeId,
      implementerIds: data.implementerIds,
      testerIds: data.testerIds,
      supporterIds: data.supporterIds,
      images: data.images,
      hasStageId: 'stageId' in data
    });

    return axiosClient.put(url, data
    ).then(response => {
      return response;
    }).catch(error => {
      throw error;
    });
  },

  /**
   * Xóa công việc
   * DELETE /task/{id}
   * @param {number} taskId - ID của công việc
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise}
   */
  delete: (taskId, enterpriseId = null, userId = null) => {
    const url = `/task/${taskId}`;

    return axiosClient.delete(url);
  },

  /**
   * Cập nhật trạng thái công việc
   * PATCH /task/{id}
   * @param {number} taskId - ID của công việc
   * @param {number} stateId - ID trạng thái mới
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Công việc đã cập nhật
   */
  updateStatus: (taskId, stateId, enterpriseId = null, userId = null) => {
    const url = `/task/${taskId}`;

    // Ensure stateId is a number
    const numericStateId = typeof stateId === 'string' ? parseInt(stateId, 10) : stateId;

    return axiosClient.patch(url, { id: numericStateId }).then(response => {
      return response;
    }).catch(error => {
      throw error;
    });
  },
};

export default taskApi;
