/**
 * Fixed Task States - Trạng thái công việc cố định
 * Sử dụng cho mọi công việc, mọi sự kiện
 * Values: PENDING, IN_PROGRESS, DONE, CANCELED
 */
export const TASK_STATES = [
  {
    id: 'PENDING',
    name: 'Chờ xử lý',
    color: '#FFA726', // Orange
    description: 'Công việc đang chờ được xử lý'
  },
  {
    id: 'IN_PROGRESS',
    name: 'Đang thực hiện',
    color: '#42A5F5', // Blue
    description: 'Công việc đang được thực hiện'
  },
  {
    id: 'DONE',
    name: 'Hoàn thành',
    color: '#66BB6A', // Green
    description: 'Công việc đã hoàn thành thành công'
  },
  {
    id: 'CANCELLED',
    name: 'Hủy bỏ',
    color: '#EF5350', // Red
    description: 'Công việc đã bị hủy'
  }
];

/**
 * Get task state by ID
 * @param {string} stateId - ID của trạng thái
 * @returns {object|null} Task state object hoặc null
 */
export const getTaskStateById = (stateId) => {
  return TASK_STATES.find(state => state.id === stateId) || null;
};

/**
 * Get task state color by ID
 * @param {string} stateId - ID của trạng thái
 * @returns {string} Color hex code
 */
export const getTaskStateColor = (stateId) => {
  const state = getTaskStateById(stateId);
  return state ? state.color : '#9E9E9E'; // Default gray
};

/**
 * Get task state name by ID
 * @param {string} stateId - ID của trạng thái
 * @returns {string} State name
 */
export const getTaskStateName = (stateId) => {
  const state = getTaskStateById(stateId);
  return state ? state.name : 'Không xác định';
};

export default TASK_STATES;
