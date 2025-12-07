import React from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  alpha,
  useTheme,
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
 */
const QuoteRequestDetail = ({ rfq, onBack, onEdit }) => {
  const theme = useTheme();

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
  if (rfq.state === "DRAFT" && onEdit) {
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
    title: `Yêu cầu báo giá #${rfq.id} - ${rfq.name || "Không có tên"}`,
    status: {
      label: getStateLabel(rfq.state),
      color: getStateColor(rfq.state),
    },
    createdBy: rfq.creator?.name || rfq.creatorName || "N/A",
    createdDate: rfq.createdAt || new Date(),
    actions,
    additionalInfo: {
      "Sản phẩm": rfq.product?.name || rfq.productName || "N/A",
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
      {/* Content Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          Thông tin chi tiết yêu cầu
        </Typography>

        <Grid container spacing={3}>
          {/* Product Information */}
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
                <ProductIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin sản phẩm
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
                      Tên sản phẩm
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {rfq.product?.name || rfq.productName || "N/A"}
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
                      Số lượng
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      {rfq.quantity || 0} {rfq.product?.unit || ""}
                    </Typography>
                  </Box>
                </Grid>

                {rfq.product?.description && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Mô tả sản phẩm
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.8,
                          color: "text.secondary",
                        }}
                      >
                        {rfq.product.description}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Project Information */}
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
                <ProjectIcon sx={{ fontSize: 20, color: "info.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin dự án
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
                      Tên dự án
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {rfq.project?.name || rfq.projectName || "—"}
                    </Typography>
                  </Box>
                </Grid>

                {rfq.project?.description && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Mô tả dự án
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.8,
                          color: "text.secondary",
                        }}
                      >
                        {rfq.project.description}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Request Information */}
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
                  Thông tin yêu cầu
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
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
                </Grid>

                <Grid item xs={12}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                    >
                      Trạng thái hiện tại
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getStateLabel(rfq.state)}
                        color={getStateColor(rfq.state)}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Notes */}
          {rfq.note && (
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
                  <DescriptionIcon
                    sx={{ fontSize: 20, color: "warning.main" }}
                  />
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
                  {rfq.note}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Additional Info Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.04),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <QuantityIcon sx={{ fontSize: 20, color: "success.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tóm tắt yêu cầu
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Sản phẩm yêu cầu:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {rfq.product?.name || rfq.productName || "N/A"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Số lượng cần báo giá:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "success.main" }}
                  >
                    {rfq.quantity || 0} {rfq.product?.unit || ""}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Thuộc dự án:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {rfq.project?.name || rfq.projectName || "—"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Hạn nhận báo giá:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {rfq.expiredAt
                      ? new Date(rfq.expiredAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </TemplateDetailLayout>
  );
};

export default QuoteRequestDetail;
