import React from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Grid,  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Business as EnterpriseIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";

/**
 * SupplierQuotationDetail - Trang chi tiết báo giá (Supplier side)
 * @param {Object} quotation - Dữ liệu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onEdit - Callback khi click nút sửa (optional)
 * @param {Boolean} loading - Loading state khi fetch dữ liệu
 */
const SupplierQuotationDetail = ({ quotation, onBack, onEdit, loading = false }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  if (!quotation) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Không có dữ liệu báo giá</Typography>
      </Box>
    );
  }

  // Map trạng thái
  const getStatusLabel = (state) => {
    switch (state) {
      case "DRAFT":
        return "Nháp";
      case "SUBMITTED":
        return "Đã gửi";
      case "ACCEPTED":
        return "Chấp nhận";
      case "REJECTED":
        return "Từ chối";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return state || "Không xác định";
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case "DRAFT":
        return "default";
      case "SUBMITTED":
        return "warning";
      case "ACCEPTED":
        return "success";
      case "REJECTED":
        return "error";
      case "EXPIRED":
        return "default";
      default:
        return "default";
    }
  };

  // Format payment method
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "CASH":
        return "Tiền mặt";
      case "TRANSFER":
      case "BANK_TRANSFER":
        return "Chuyển khoản";
      case "VNPAY":
        return "VNPAY";
      case "MOMO":
        return "Ví MOMO";
      case "CREDIT_CARD":
        return "Thẻ tín dụng";
      case "MOBILE_PAYMENT":
        return "Thanh toán qua điện thoại";
      case "CHECK":
        return "Séc";
      default:
        return method || "Không xác định";
    }
  };

  // Format date time
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Get enterprise name
  const getEnterpriseName = () => {
    return quotation.enterprise?.name || quotation.enterpriseName || quotation.rfq?.enterprise?.name || "N/A";
  };

  // Prepare actions
  const actions = [
    {
      label: "Quay lại",
      icon: <BackIcon />,
      onClick: onBack,
      variant: "outlined",
    },
  ];

  // Add edit button if state is DRAFT and onEdit is provided
  // if (quotation.state === "DRAFT" && onEdit) {
  //   actions.unshift({
  //     label: "Sửa",
  //     icon: <EditIcon />,
  //     onClick: onEdit,
  //     variant: "contained",
  //     color: "primary",
  //   });
  // }

  // Prepare props cho TemplateDetailLayout
  const layoutProps = {
    title: `Báo giá - ${quotation.name || "Không có tên"}`,
    status: {
      label: getStatusLabel(quotation.state),
      color: getStatusColor(quotation.state),
    },
    actions,
    additionalInfo: {
      "Số lượng": quotation.quantity || 0,
      "Đơn giá": `${quotation.unitPrice ? quotation.unitPrice.toLocaleString("vi-VN") : 0}₫`,
      "Tổng tiền": `${quotation.finalPrice ? quotation.finalPrice.toLocaleString("vi-VN") : 0}₫`,
      "Hạn báo giá": formatDateTime(quotation.expiredAt),
    },
  };

  return (
    <TemplateDetailLayout {...layoutProps}>
      {/* Content Section - 2 Column Layout */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1 }}>
          {/* Enterprise Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin doanh nghiệp
            </Typography>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Tên doanh nghiệp
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {getEnterpriseName()}
              </Typography>
            </Box>

            {quotation.rfq && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Yêu cầu báo giá
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {quotation.rfq.name || `RFQ #${quotation.rfq.id}`}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Pricing Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin giá
            </Typography>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Số lượng
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quotation.quantity || 0}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Đơn giá
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quotation.unitPrice ? quotation.unitPrice.toLocaleString("vi-VN") : 0}₫
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Tổng giá (Số lượng × Đơn giá)
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {quotation.totalPrice ? quotation.totalPrice.toLocaleString("vi-VN") : 0}₫
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Phụ phí
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {quotation.otherFee ? quotation.otherFee.toLocaleString("vi-VN") + "₫" : "0₫"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>
          {/* Final Price */}
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.08), border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
              Tổng tiền cuối cùng
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
              {quotation.finalPrice ? quotation.finalPrice.toLocaleString("vi-VN") : 0}₫
            </Typography>
          </Box>

          {/* Payment Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin thanh toán
            </Typography>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Phương thức thanh toán
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {getPaymentMethodLabel(quotation.paymentMethod)}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Hạn báo giá
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDateTime(quotation.expiredAt)}
              </Typography>
            </Box>

            {quotation.paymentTerms && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Điều khoản thanh toán
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "text.secondary" }}>
                  {quotation.paymentTerms}
                </Typography>
              </Box>
            )}

            {quotation.guarantee && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Bảo hành
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "text.secondary" }}>
                  {quotation.guarantee}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Notes */}
          {quotation.note && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Ghi chú
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "text.secondary" }}>
                {quotation.note}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </TemplateDetailLayout>
  );
};

export default SupplierQuotationDetail;

