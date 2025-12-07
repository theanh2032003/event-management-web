import React from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  Business as EnterpriseIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../components/common/TemplateDetailLayout";

/**
 * SupplierQuotationDetail - Trang chi tiết báo giá (Supplier side)
 * @param {Object} quotation - Dữ liệu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onEdit - Callback khi click nút sửa (optional)
 */
const SupplierQuotationDetail = ({ quotation, onBack, onEdit }) => {
  const theme = useTheme();

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
  if (quotation.state === "DRAFT" && onEdit) {
    actions.unshift({
      label: "Sửa",
      icon: <EditIcon />,
      onClick: onEdit,
      variant: "contained",
      color: "primary",
    });
  }

  // Prepare props cho TemplateDetailLayout
  const layoutProps = {
    title: `Báo giá #${quotation.id} - ${quotation.name || "Không có tên"}`,
    status: {
      label: getStatusLabel(quotation.state),
      color: getStatusColor(quotation.state),
    },
    createdBy: "Bạn (Nhà cung cấp)",
    createdDate: quotation.createdAt || new Date(),
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
      {/* Content Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          Thông tin chi tiết báo giá
        </Typography>

        <Grid container spacing={3}>
          {/* Enterprise Information */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <EnterpriseIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin doanh nghiệp
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Tên doanh nghiệp
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {getEnterpriseName()}
                    </Typography>
                  </Box>
                </Grid>

                {quotation.rfq && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Yêu cầu báo giá
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {quotation.rfq.name || `RFQ #${quotation.rfq.id}`}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Pricing Information */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin giá
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Số lượng
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {quotation.quantity || 0}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Đơn giá
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      {quotation.unitPrice
                        ? quotation.unitPrice.toLocaleString("vi-VN")
                        : 0}
                      ₫
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Tổng giá (Quantity × Unit Price)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotation.totalPrice
                        ? quotation.totalPrice.toLocaleString("vi-VN")
                        : 0}
                      ₫
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Thuế
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotation.tax
                        ? quotation.tax.toLocaleString("vi-VN") + "₫"
                        : "0₫"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Giảm giá
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotation.discount
                        ? quotation.discount.toLocaleString("vi-VN") + "₫"
                        : "Không"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Shipping & Other Fees */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.04),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ShippingIcon sx={{ fontSize: 20, color: "info.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Phí vận chuyển & Phụ phí
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Phí vận chuyển
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotation.shippingFee
                        ? quotation.shippingFee.toLocaleString("vi-VN") + "₫"
                        : "Không"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Phí khác
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotation.otherFee
                        ? quotation.otherFee.toLocaleString("vi-VN") + "₫"
                        : "Không"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Final Price */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, display: "block", mb: 1 }}
              >
                Tổng tiền cuối cùng
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                {quotation.finalPrice
                  ? quotation.finalPrice.toLocaleString("vi-VN")
                  : 0}
                ₫
              </Typography>
            </Box>
          </Grid>

          {/* Payment Information */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ReceiptIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin thanh toán và điều khoản
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Phương thức thanh toán
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {getPaymentMethodLabel(quotation.paymentMethod)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Hạn báo giá
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDateTime(quotation.expiredAt)}
                    </Typography>
                  </Box>
                </Grid>

                {quotation.paymentTerms && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Điều khoản thanh toán
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.8,
                        }}
                      >
                        {quotation.paymentTerms}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {quotation.guarantee && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Bảo hành
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.8,
                        }}
                      >
                        {quotation.guarantee}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Notes */}
          {quotation.note && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <ReceiptIcon sx={{ fontSize: 20, color: "warning.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Ghi chú
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.8,
                    color: "text.secondary",
                  }}
                >
                  {quotation.note}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </TemplateDetailLayout>
  );
};

export default SupplierQuotationDetail;

