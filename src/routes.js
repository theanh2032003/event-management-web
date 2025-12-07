/**
 * Application Routes - Restructured for Workspace Architecture
 * 
 * Structure:
 * - Auth routes: /signin, /signup, etc
 * - /select-workspace: Choose enterprise or supplier workspace
 * - /enterprise/:id/*: Enterprise workspace with nested routes
 * - /supplier/:id/*: Supplier workspace (placeholder for future)
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UnauthorizedPage } from './shared/components/UnauthorizedPage';

// Auth pages
import SignIn from './features/auth/pages/SignIn';
import SignUp from './features/auth/pages/SignUp';
import VerifyEmail from './features/auth/pages/VerifyEmail';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPassword from './features/auth/pages/ResetPassword';
import SelectWorkspacePage from './features/workspace/pages/SelectWorkspacePage';

// Enterprise pages
import EnterpriseEventDetail from './features/project/pages/EventDetail';
import EnterpriseEventManagement from './features/project/pages/EventManagement';
import EnterpriseStatistics from './features/statistic/pages/EnterpriseStatistics';
import EnterpriseSettings from './features/setting/pages/Settings';
import GroupTaskStateDetail from './features/state_setting/pages/GroupTaskStateDetail';
import GroupTaskTypeDetail from './features/type_setting/pages/GroupTaskTypeDetail';
import EnterpriseMarketplace from './features/product/pages/MarketplaceEnterprise';
import EnterpriseProductDetail from './features/product/pages/ProductDetail';
import EnterpriseProfile from './features/user/pages/Profile';
import EnterpriseInfo from './features/enterprise/pages/EnterpriseInfo';
import EnterpriseQuoteRequests from './features/rfq/pages/RfqEnterprise';
import EnterpriseQuotations from './features/quote/pages/QuotationEnterprises';
import EnterpriseContracts from './features/contract/pages/ContractEnterprises';
import EnterprisePaymentApproval from './features/payment/pages/PaymentApproval';

// Shared pages
import Notifications from './features/notification/pages/Notifications';

// Supplier pages
import SupplierDashboard from './features/statistic/pages/SupplierDashboard';
import SupplierMarketplace from './features/product/pages/MarketplaceSupplier';
import CreateProduct from './features/product/pages/CreateProduct';
import EditProduct from './features/product/pages/EditProduct';
import RFQ from './features/rfq/pages/RfqSupplier';
import Quotations from './features/quote/pages/QuotationSuppliers';
import Contracts from './features/contract/pages/ContractSuppliers';
import LocationSupplier from './features/location/pages/LocationSupplier';
import LocationDetail from './features/location/pages/LocationDetail';
import SupplierInfo from './features/supplier/pages/Profile';

// Layouts
import EnterpriseLayout from './shared/layouts/EnterpriseLayout';
import SupplierLayout from './shared/layouts/SupplierLayout';

/**
 * Enterprise Routes - Wrapped với EnterpriseLayout
 * Các route được bảo vệ bằng permission check
 */
function EnterpriseRoutes() {
  return (
    <EnterpriseLayout>
      <Routes>
        {/* Event Management */}
        <Route path="event-management" element={<EnterpriseEventManagement />} />
        <Route path="event-management/:eventId" element={<EnterpriseEventDetail />} />

        {/* Statistics */}
        <Route path="statistics" element={<EnterpriseStatistics />} />

        {/* Marketplace */}
        <Route path="marketplace" element={<EnterpriseMarketplace />} />
        <Route path="marketplace/:productId" element={<EnterpriseProductDetail />} />

        {/* Quote Requests */}
        <Route path="quote-requests" element={<EnterpriseQuoteRequests />} />
        <Route path="quotations" element={<EnterpriseQuotations />} />

        {/* Contracts */}
        <Route path="contracts" element={<EnterpriseContracts />} />

        {/* Payment Approvals */}
        <Route path="payment-approvals" element={<EnterprisePaymentApproval />} />

      {/* Settings & Profile */}
      <Route path="settings" element={<EnterpriseSettings />} />
      <Route path="settings/group-task-states" element={<EnterpriseSettings />} />
      <Route path="settings/group-task-states/:groupId" element={<GroupTaskStateDetail />} />
      <Route path="settings/group-task-types" element={<EnterpriseSettings />} />
      <Route path="settings/group-task-types/:groupId" element={<GroupTaskTypeDetail />} />
      <Route path="settings/roles" element={<EnterpriseSettings />} />
      <Route path="settings/users" element={<EnterpriseSettings />} />
      <Route path="settings/locations" element={<EnterpriseSettings />} />
      <Route path="settings/locations/:locationId" element={<LocationDetail />} />
      <Route path="profile" element={<EnterpriseProfile />} />
        <Route path="info" element={<EnterpriseInfo />} />

        {/* Fallback for unmatched routes inside enterprise */}
        <Route path="*" element={<Navigate to="statistics" replace />} />
      </Routes>
    </EnterpriseLayout>
  );
}

/**
 * Supplier Routes - Wrapped với SupplierLayout
 */
function SupplierRoutes() {
  return (
    <SupplierLayout>
      <Routes>
        <Route path="dashboard" element={<SupplierDashboard />} />
        <Route path="rfq" element={<RFQ />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="marketplace" element={<SupplierMarketplace />} />
        <Route path="create-product" element={<CreateProduct />} />
        <Route path="edit-product/:productId" element={<EditProduct />} />
        <Route path="locations" element={<LocationSupplier />} />
        <Route path="locations/:locationId" element={<LocationDetail />} />
        <Route path="info" element={<SupplierInfo />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </SupplierLayout>
  );
}

/**
 * Main App Routes
 * Note: BrowserRouter được wrap từ App.js (AuthProvider)
 * Root "/" được handle bởi AuthProvider - không redirect ở route level
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Root route - AuthProvider sẽ handle redirect */}
      <Route path="/" element={<SignIn />} />
      
      {/* Auth routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Workspace selection */}
      <Route path="/select-workspace" element={<SelectWorkspacePage />} />
      
      {/* Notifications - Shared route */}
      <Route path="/notifications" element={<Notifications />} />
      
      {/* Unauthorized page - Khi user không có quyền */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Enterprise workspace - nested routes */}
      <Route path="/enterprise/:id/*" element={<EnterpriseRoutes />} />
      
      {/* Supplier workspace - placeholder */}
      <Route path="/supplier/:id/*" element={<SupplierRoutes />} />
      
      {/* Fallback - AuthProvider sẽ handle "/" redirect, fallback này cho 404 only */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
}

export default AppRoutes;