import axiosClient from '../../../app/axios/axiosClient';
/**
 * Comment API - Quản lý bình luận trong công việc
 * Base URL: /task/{taskId}/comments
 */
const commentApi = {
  /**
   * Lấy danh sách bình luận của công việc
   * GET /task/{taskId}/comments
   * @param {number} taskId - ID của công việc
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Danh sách bình luận
   */
  getAll: (taskId, enterpriseId = null) => {
    const url = `/task/${taskId}/comments`;
    const entId = enterpriseId || localStorage.getItem("enterpriseId");
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    console.log("💬 GET Comments - Request:", {
      url,
      taskId,
      enterpriseId: entId
    });

    return axiosClient.get(url, { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'enterprise-id': entId      
      }
    }).then(data => {
      console.log("✅ GET Comments - Success Response:", {
        dataType: typeof data,
        isArray: Array.isArray(data),
        dataLength: data?.length,
        data: data
      });
      return data;
    }).catch(error => {
      console.error("❌ GET Comments - Error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    });
  },

  /**
   * Tạo bình luận mới
   * POST /task/{taskId}/comments
   * @param {number} taskId - ID của công việc
   * @param {object} data - Dữ liệu bình luận
   * @param {number|null} data.parentId - ID bình luận cha (null nếu là bình luận mới)
   * @param {string} data.content - Nội dung bình luận
   * @param {number[]} data.taggedUserIds - Danh sách ID người dùng được tag
   * @param {string[]} data.files - Danh sách file đính kèm
   * @param {number} enterpriseId - ID doanh nghiệp (optional, sẽ lấy từ localStorage nếu không truyền)
   * @param {number} userId - ID người dùng (optional, sẽ lấy từ localStorage nếu không truyền)
   * @returns {Promise} Bình luận đã tạo
   */
  create: (taskId, data, enterpriseId = null, userId = null) => {
    const url = `/task/${taskId}/comments`;
    const entId = enterpriseId || localStorage.getItem("enterpriseId");
    const usrId = userId || localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    if (!entId) {
      throw new Error("enterprise-id không tồn tại. Vui lòng chọn doanh nghiệp.");
    }

    if (!usrId) {
      throw new Error("user-id không tồn tại. Vui lòng đăng nhập lại.");
    }

    console.log("💬 CREATE Comment - Request:", {
      url,
      taskId,
      enterpriseId: entId,
      userId: usrId,
      data
    });

    return axiosClient.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "enterprise-id": entId,
        "user-id": usrId
      }
    }).then(data => {
      console.log("✅ CREATE Comment - Success Response:", data);
      return data;
    }).catch(error => {
      console.error("❌ CREATE Comment - Error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    });
  },

  /**
   * Reply vào một bình luận
   * POST /task/{taskId}/comments (với parentId)
   * @param {number} taskId - ID của công việc
   * @param {number} parentId - ID của bình luận cha
   * @param {object} data - Dữ liệu reply
   * @param {string} data.content - Nội dung reply
   * @param {number[]} data.taggedUserIds - Danh sách ID người dùng được tag
   * @param {string[]} data.files - Danh sách file đính kèm
   * @param {number} enterpriseId - ID doanh nghiệp (optional)
   * @param {number} userId - ID người dùng (optional)
   * @returns {Promise} Reply đã tạo
   */
  reply: (taskId, parentId, data, enterpriseId = null, userId = null) => {
    return commentApi.create(taskId, {
      ...data,
      parentId
    }, enterpriseId, userId);
  }
};

export default commentApi;
