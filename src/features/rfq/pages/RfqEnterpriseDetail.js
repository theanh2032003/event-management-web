import React from "react";
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
  RequestQuote as RequestQuoteIcon,
  Inventory as ProductIcon,
  Numbers as QuantityIcon,
  FolderOpen as ProjectIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";

/**
 * QuoteRequestDetail - Trang chi tiết yêu cầu báo giá
 * @param {Object} rfq - Dữ liệu yêu cầu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onEdit - Callback khi click nút sửa (optional)
 * @param {Boolean} loading - Loading state (optional)
 */
const QuoteRequestDetail = ({ rfq, onBack, onEdit, loading = false }) => {
  const theme = useTheme();

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
      default:
        return "default";
    }
  };

  // Prepare actions
  const actions = [
    {
      label: "Quay lại",
      icon: <RequestQuoteIcon />,
      onClick: onBack,
      variant: "outlined",
    },
  ];

  // Add edit button if state is DRAFT and onEdit is provided
  // if (rfq.state === "DRAFT" && onEdit) {
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
    title: `Yêu cầu báo giá - ${rfq.name || "Không có tên"}`,
    status: {
      label: getStateLabel(rfq.state),
      color: getStateColor(rfq.state),
    },
    actions,
    additionalInfo: {
      "Sản phẩm": rfq.productSnapshot?.name || rfq.productName || "N/A",
      "Số lượng": `${rfq.quantity || 0} ${rfq.product?.unit || ""}`,
      "Dự án": rfq.project?.name || rfq.projectName || "—",
      "Hạn gửi": rfq.expiredAt
        ? new Date(rfq.expiredAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
  };

  return (
    <TemplateDetailLayout {...layoutProps}>
      {/* Content Section - 2 Column Layout */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1 }}>
          {/* Creator Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin người tạo
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Người tạo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.createdUser?.name || rfq.creatorName || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Ngày tạo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.createdAt
                  ? new Date(rfq.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </Typography>
            </Box>
          </Box>

          {/* Product Information */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Thông tin sản phẩm
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Tên sản phẩm
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq?.productSnapshot?.name || rfq.productName || "N/A"}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Số lượng
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500}}>
                {rfq.quantity || 0} {rfq.product?.unit || ""}
              </Typography>
            </Box>

            {rfq.product?.description && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Mô tả sản phẩm
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-wrap", color: "text.secondary" }}>
                  {rfq?.productSnapshot?.description}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Project Information */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Thông tin dự án
              </Typography>
            </Box>

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
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin nhà cung cấp
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Tên nhà cung cấp
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.supplier?.name || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.supplier?.email || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Số điện thoại
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.supplier?.phone || "N/A"}
              </Typography>
            </Box>
          </Box>
          {/* Request Information */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Thông tin yêu cầu
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Hạn gửi
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {rfq.expiredAt
                  ? new Date(rfq.expiredAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tóm tắt yêu cầu
              </Typography>
            </Box>

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
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                  {rfq.expiredAt ? new Date(rfq.expiredAt).toLocaleDateString("vi-VN") : "—"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </TemplateDetailLayout>
  );
};

export default QuoteRequestDetail;
