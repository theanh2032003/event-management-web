import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useToast } from '../../../app/providers/ToastContext';
import paymentApprovalApi from '../api/paymentApproval.api';
import PaymentApprovalDetail from './PaymentApprovalDetail';

/**
 * PaymentApprovalDetailPage - Trang chi tiết của 1 Payment Approval
 * Load chi tiết từ URL param :paymentApprovalId
 */
function PaymentApprovalDetailPage() {
  const { id: enterpriseId, paymentApprovalId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load chi tiết payment approval khi component mount hoặc ID thay đổi
  useEffect(() => {
    loadPaymentDetail();
  }, [paymentApprovalId]);

  const loadPaymentDetail = async () => {
    try {
      setLoading(true);
      const response = await paymentApprovalApi.getPaymentApprovalById(paymentApprovalId);
      setPayment(response);
    } catch (error) {
      showToast(`Lỗi khi tải chi tiết: ${error?.response?.data?.message || error.message}`, 'error', 3000);
      // Redirect về danh sách nếu lỗi
      setTimeout(() => {
        navigate(`/enterprise/${enterpriseId}/payment-approvals`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/enterprise/${enterpriseId}/payment-approvals`);
  };



  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={50} />
        <Typography>Đang tải chi tiết...</Typography>
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          Không tìm thấy chi tiết thanh toán
        </Typography>
      </Box>
    );
  }

  return <PaymentApprovalDetail payment={payment} onBack={handleBack}  />;
}

export default PaymentApprovalDetailPage;
