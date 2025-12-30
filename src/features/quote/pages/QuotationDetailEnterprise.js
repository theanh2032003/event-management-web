import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";
import supplierApi from "../../supplier/api/supplier.api";

/**
 * QuotationDetail - Trang chi tiết báo giá
 * @param {Object} quotation - Dữ liệu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Boolean} loading - Loading state khi fetch dữ liệu
 */
const QuotationDetail = ({ quotation, onBack, loading = false }) => {
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
    title: `Báo giá - ${quotation.name || "Không có tên"}`,
    status: {
      label: getStatusLabel(quotation.state),
      color: getStatusColor(quotation.state),
    },
    // createdBy: getSupplierName(),
    // createdDate: quotation.createdAt || new Date(),
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
      {/* Content Section - 2 Column Layout */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1 }}>
          {/* Supplier Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin nhà cung cấp
            </Typography>

            {loadingSupplier ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Đang tải...
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    Tên nhà cung cấp
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {getSupplierName()}
                  </Typography>
                </Box>

                {supplierInfo?.email && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplierInfo.email}
                    </Typography>
                  </Box>
                )}

                {supplierInfo?.phone && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplierInfo.phone}
                    </Typography>
                  </Box>
                )}

                {supplierInfo?.address && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Địa chỉ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplierInfo.address}
                    </Typography>
                  </Box>
                )}
              </>
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
              <Typography variant="body1" sx={{ fontWeight: 600, color: "success.main" }}>
                {quotation.unitPrice ? quotation.unitPrice.toLocaleString("vi-VN") : 0}₫
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Giảm giá
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {quotation.discount ? quotation.discount.toLocaleString("vi-VN") + "₫" : "Không"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>
                    <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Phụ phí
            </Typography>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Phí khác
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {quotation.otherFee ? quotation.otherFee.toLocaleString("vi-VN") + "₫" : "Không"}
              </Typography>
            </Box>
          </Box>  
          {/* Final Price */}
          <Box sx={{ mt: 2, mb: 3, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.08), border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`, textAlign: "center" }}>
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

export default QuotationDetail;
