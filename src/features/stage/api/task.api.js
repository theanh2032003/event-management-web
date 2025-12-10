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
      ...(queryParams.projectId !== undefined && { projectId: queryParams.projectId }),
      ...(queryParams.stageId !== undefined && { stageId: queryParams.stageId }),
      ...(queryParams.typeId !== undefined && { typeId: queryParams.typeId }),
      ...(queryParams.states !== undefined && { states: queryParams.states }),
      ...(queryParams.keyword && { keyword: queryParams.keyword }),
      ...(queryParams.page !== undefined && { page: queryParams.page }),
      ...(queryParams.size !== undefined && { size: queryParams.size }),
      ...(queryParams.sort && { sort: queryParams.sort }),
    };
    
    return axiosClient.get(url, { params });
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
   * @param {object} data - Dữ liệu công việc (name, description, images, supporterIds, testerIds, implementerIds, state, typeId, stageId)
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
   * @param {object} data - Dữ liệu công việc (name, description, images, supporterIds, testerIds, implementerIds, state, typeId)
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Công việc đã cập nhật
   */
  update: (taskId, data) => {
    const url = `/task/${taskId}`;

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
   * @param {string} state - Trạng thái mới (PENDING, IN_PROGRESS, SUCCESS, CANCEL)
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Công việc đã cập nhật
   */
  updateStatus: (taskId, state) => {
    const url = `/task/${taskId}`;

    return axiosClient.patch(url, { state }).then(response => {
      return response;
    }).catch(error => {
      throw error;
    });
  },
};

export default taskApi;
