import React from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  RequestQuote as RequestQuoteIcon,
  Inventory as ProductIcon,
  FolderOpen as ProjectIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";

/**
 * SupplierRFQDetail - Trang chi tiết yêu cầu báo giá (Supplier side)
 * @param {Object} rfq - Dữ liệu yêu cầu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onCreateQuote - Callback khi tạo báo giá (optional)
 * @param {Boolean} loading - Loading state (optional)
 */
const SupplierRFQDetail = ({ rfq, onBack, onCreateQuote, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rfq) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Không có dữ liệu yêu cầu báo giá
        </Typography>
      </Box>
    );
  }

  // Map trạng thái
  const getStateLabel = (state) => {
    switch (state) {
      case "DRAFT":
        return "Bản nháp";
      case "SENT":
        return "Đã gửi";
      case "CANCELLED":
        return "Đã hủy";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return state || "Không xác định";
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "DRAFT":
        return "warning";
      case "SENT":
        return "info";
      case "CANCELLED":
        return "error";
      case "EXPIRED":
        return "default";
      default:
        return "default";
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
    return rfq.enterprise?.name || rfq.enterpriseName || "N/A";
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

  // Add create quote button if onCreateQuote is provided and state is SENT
  // if (rfq.state === "SENT" && onCreateQuote) {
  //   actions.unshift({
  //     label: "Tạo báo giá",
  //     icon: <AddIcon />,
  //     onClick: onCreateQuote,
  //     variant: "contained",
  //     color: "primary",
  //   });
  // }

  // Prepare props cho TemplateDetailLayout
  const layoutProps = {
    title: `Yêu cầu báo giá - ${rfq.name || "Không có tên"}`,
    status: {
      label: getStateLabel(rfq.state),
      color: getStateColor(rfq.state),
    },
    // createdBy: getEnterpriseName(),
    // createdDate: rfq.createdAt || new Date(),
    actions,
    additionalInfo: {
      "Sản phẩm": rfq.product?.name || rfq.productName || "N/A",
      "Số lượng": `${rfq.quantity || 0}`,
      "Dự án": rfq.project?.name || rfq.projectName || "—",
      "Hạn gửi": formatDateTime(rfq.expiredAt),
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
            {rfq.enterprise?.email && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {rfq.enterprise.email}
                </Typography>
              </Box>
            )}
            {rfq.enterprise?.phone && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Số điện thoại
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {rfq.enterprise.phone}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Product Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin sản phẩm
            </Typography>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Tên sản phẩm
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq?.product?.name || rfq.productName || "N/A"}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Số lượng
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.quantity || 0} {rfq.product?.unit || ""}
              </Typography>
            </Box>

            {rfq.product?.description && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Mô tả sản phẩm
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", color: "text.secondary" }}>
                  {rfq?.product?.description}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Project Information */}
          {rfq.project && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Thông tin dự án
              </Typography>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Tên dự án
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {rfq.project?.name || rfq.projectName || "—"}
                </Typography>
              </Box>

              {rfq.project?.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    Mô tả dự án
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", color: "text.secondary" }}>
                    {rfq.project.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>
          {/* Request Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin yêu cầu
            </Typography>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Hạn gửi
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDateTime(rfq.expiredAt)}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Ngày tạo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDateTime(rfq.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Trạng thái
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={getStateLabel(rfq.state)}
                  color={getStateColor(rfq.state)}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>

            {rfq.note && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Ghi chú
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", color: "text.secondary" }}>
                  {rfq.note}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Summary Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Tóm tắt yêu cầu
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, minWidth: "120px" }}>
                  Sản phẩm:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {rfq.product?.name || rfq.productName || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, minWidth: "120px" }}>
                  Số lượng:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600}}>
                  {rfq.quantity || 0} {rfq.product?.unit || ""}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, minWidth: "120px" }}>
                  Dự án:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {rfq.project?.name || rfq.projectName || "—"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, minWidth: "120px" }}>
                  Hạn báo giá:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDateTime(rfq.expiredAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </TemplateDetailLayout>
  );
};

export default SupplierRFQDetail;

