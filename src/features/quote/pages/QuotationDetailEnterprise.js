import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Business as SupplierIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";
import supplierApi from "../../supplier/api/supplier.api";

/**
 * QuotationDetail - Trang chi tiết báo giá
 * @param {Object} quotation - Dữ liệu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 */
const QuotationDetail = ({ quotation, onBack }) => {
  const theme = useTheme();
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [loadingSupplier, setLoadingSupplier] = useState(false);

  // Fetch supplier info
  useEffect(() => {
    const fetchSupplier = async () => {
      if (quotation?.supplierId) {
        try {
          setLoadingSupplier(true);
          const response = await supplierApi.getSupplierById(quotation.supplierId);
          setSupplierInfo(response?.data || response);
        } catch (error) {
          console.error("[QUOTATION_DETAIL] Error fetching supplier:", error);
        } finally {
          setLoadingSupplier(false);
        }
      }
    };

    fetchSupplier();
  }, [quotation?.supplierId]);

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
        return "Chuyển khoản";
      default:
        return method || "Không xác định";
    }
  };

  // Get supplier name
  const getSupplierName = () => {
    if (loadingSupplier) return "Đang tải...";
    return supplierInfo?.name || quotation.supplier?.name || quotation.supplierName || "N/A";
  };

  // Prepare props cho TemplateDetailLayout
  const layoutProps = {
    title: `Báo giá #${quotation.id} - ${quotation.name || "Không có tên"}`,
    status: {
      label: getStatusLabel(quotation.state),
      color: getStatusColor(quotation.state),
    },
    createdBy: getSupplierName(),
    createdDate: quotation.createdAt || new Date(),
    actions: [
      {
        label: "Quay lại",
        icon: <ReceiptIcon />,
        onClick: onBack,
        variant: "outlined",
      },
    ],
    additionalInfo: {
      "Số lượng": quotation.quantity || 0,
      "Đơn giá": `${quotation.unitPrice ? quotation.unitPrice.toLocaleString("vi-VN") : 0}₫`,
      "Tổng tiền": `${quotation.finalPrice ? quotation.finalPrice.toLocaleString("vi-VN") : 0}₫`,
      "Hạn báo giá": quotation.expiredAt
        ? new Date(quotation.expiredAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
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
          {/* Supplier Information */}
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
                <SupplierIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin nhà cung cấp
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {loadingSupplier ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải thông tin nhà cung cấp...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Tên nhà cung cấp
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getSupplierName()}
                      </Typography>
                    </Box>
                  </Grid>

                  {supplierInfo?.email && (
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                        >
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {supplierInfo.email}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {supplierInfo?.phone && (
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                        >
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {supplierInfo.phone}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {supplierInfo?.address && (
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                        >
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {supplierInfo.address}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
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
                      Thuế (%)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quotation.tax || 0}%
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
                <CalendarIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin thanh toán và điểu khoản
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
                  <DescriptionIcon sx={{ fontSize: 20, color: "warning.main" }} />
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

export default QuotationDetail;
