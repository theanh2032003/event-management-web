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
  RequestQuote as RequestQuoteIcon,
  Inventory as ProductIcon,
  FolderOpen as ProjectIcon,
  Business as EnterpriseIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";

/**
 * SupplierRFQDetail - Trang chi tiết yêu cầu báo giá (Supplier side)
 * @param {Object} rfq - Dữ liệu yêu cầu báo giá từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onCreateQuote - Callback khi tạo báo giá (optional)
 */
const SupplierRFQDetail = ({ rfq, onBack, onCreateQuote }) => {
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
  if (rfq.state === "SENT" && onCreateQuote) {
    actions.unshift({
      label: "Tạo báo giá",
      icon: <AddIcon />,
      onClick: onCreateQuote,
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
    createdBy: getEnterpriseName(),
    createdDate: rfq.createdAt || new Date(),
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
      {/* Content Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          Thông tin chi tiết yêu cầu
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

                {rfq.enterprise?.email && (
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
                        {rfq.enterprise.email}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {rfq.enterprise?.phone && (
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
                        {rfq.enterprise.phone}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

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
                  Thông tin sản phẩm/dịch vụ
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
                      Tên sản phẩm/dịch vụ
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
                      Số lượng yêu cầu
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

                {rfq.product?.category && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                      >
                        Danh mục
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {rfq.product.category}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Project Information */}
          {rfq.project && (
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
                        {rfq.project.name || rfq.projectName || "—"}
                      </Typography>
                    </Box>
                  </Grid>

                  {rfq.project.description && (
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
          )}

          {/* Request Information */}
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
                <RequestQuoteIcon sx={{ fontSize: 20, color: "success.main" }} />
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
                      Hạn gửi báo giá
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDateTime(rfq.expiredAt)}
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
                      Ngày tạo yêu cầu
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDateTime(rfq.createdAt)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      p: 2,
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
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
                        {formatDateTime(rfq.expiredAt)}
                      </Typography>
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
                  <RequestQuoteIcon sx={{ fontSize: 20, color: "warning.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Ghi chú từ doanh nghiệp
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
        </Grid>
      </Box>
    </TemplateDetailLayout>
  );
};

export default SupplierRFQDetail;

