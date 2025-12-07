/**
 * API Index - Central export cho tất cả API modules
 */

import authApi from '../features/auth/api/auth.api';
import supplierApi from './supplierApi';
import enterpriseApi from './enterpriseApi';
import settingsApi from './settingsApi';
import userApi from '../features/user/api/user.api';
import stageApi from '../features/stage/api/stage.api';
import taskCategoryApi from './taskType.api';
import roleApi from '../features/permission/api/role.api';
import productApi from './productApi';
import categoryApi from './categoryApi';
import commentApi from './commentApi';
import ticketTypeApi from './ticketTypeApi';

export {
  authApi,
  supplierApi,
  enterpriseApi,
  settingsApi,
  userApi,
  stageApi,
  taskCategoryApi,
  roleApi,
  productApi,
  categoryApi,
  commentApi,
  ticketTypeApi,
};

export default {
  auth: authApi,
  supplier: supplierApi,
  enterprise: enterpriseApi,
  settings: settingsApi,
  user: userApi,
  stage: stageApi,
  taskCategory: taskCategoryApi,
  role: roleApi,
  product: productApi,
  category: categoryApi,
  comment: commentApi,
  ticketType: ticketTypeApi,
};
