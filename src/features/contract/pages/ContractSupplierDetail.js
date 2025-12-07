import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
  List,
  ListItem,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Assignment as TermsIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import TemplateDetailLayout from "../../../components/common/TemplateDetailLayout";
import enterpriseApi from "../../api/enterpriseApi";
import contractApi from "../api/contract.api";

/**
 * SupplierContractDetail - Trang chi tiết hợp đồng (Supplier side)
 * @param {Object} contract - Dữ liệu hợp đồng từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 */
const SupplierContractDetail = ({ contract, onBack, onRefresh }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [enterpriseInfo, setEnterpriseInfo] = useState(null);
  const [loadingEnterprise, setLoadingEnterprise] = useState(false);
  const [stateChanging, setStateChanging] = useState(false);

  // Fetch enterprise info
  useEffect(() => {
    const fetchEnterprise = async () => {
      if (contract?.enterpriseId) {
        try {
          setLoadingEnterprise(true);
          const response = await enterpriseApi.getEnterpriseById(contract.enterpriseId);
          setEnterpriseInfo(response?.data || response);
        } catch (error) {
          console.error("[CONTRACT_DETAIL] Error fetching enterprise:", error);
        } finally {
          setLoadingEnterprise(false);
        }
      }
    };

    fetchEnterprise();
  }, [contract?.enterpriseId]);

  if (!contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Không có dữ liệu hợp đồng</Typography>
      </Box>
    );
  }

  // Map trạng thái
  const getStateLabel = (state) => {
    switch (state) {
      case "DRAFT":
        return "Bản nháp";
      case "SUBMITTED":
        return "Đã gửi";
      case "SIGNED":
        return "Đã ký";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELED":
        return "Đã hủy";
      default:
        return state || "Không xác định";
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "DRAFT":
        return "default";
      case "SUBMITTED":
        return "info";
      case "SIGNED":
        return "primary";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELED":
        return "error";
      default:
        return "default";
    }
  };

  // Get enterprise name
  const getEnterpriseName = () => {
    if (loadingEnterprise) return "Đang tải...";
    return enterpriseInfo?.name || contract.enterprise?.name || contract.enterpriseName || "N/A";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Handle state change
  const handleStateChange = async (newState) => {
    // Validate state transition
    const validTransitions = {
      'SUBMITTED': ['SIGNED'],
      'IN_PROGRESS': ['COMPLETED'],
    };

    if (!validTransitions[contract.state] || !validTransitions[contract.state].includes(newState)) {
      enqueueSnackbar("Chuyển đổi trạng thái không hợp lệ", { variant: "error" });
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang "${getStateLabel(newState)}"?`)) {
      return;
    }

    try {
      setStateChanging(true);
      
      await contractApi.updateContractState(contract.id, { state: newState });
      
      enqueueSnackbar("Đã cập nhật trạng thái hợp đồng", { variant: "success" });
      
      // Refresh data if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("[CONTRACT_DETAIL] Error changing contract state:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi thay đổi trạng thái. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setStateChanging(false);
    }
  };

  // Get available state transitions for supplier
  const getAvailableStates = (currentState) => {
    const transitions = {
      'SUBMITTED': ['SIGNED'],
      'IN_PROGRESS': ['COMPLETED'],
    };
    return transitions[currentState] || [];
  };

  // Check if state can be changed
  const canChangeState = (currentState) => {
    return ['SUBMITTED', 'IN_PROGRESS'].includes(currentState);
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

  // Prepare props cho TemplateDetailLayout
  const layoutProps = {
    title: `Hợp đồng #${contract.id} - ${contract.name || "Không có tên"}`,
    status: {
      label: getStateLabel(contract.state),
      color: getStateColor(contract.state),
    },
    createdBy: getEnterpriseName(),
    createdDate: contract.createdAt || new Date(),
    actions,
    additionalInfo: {
      "Tổng giá trị": `${contract.totalValue ? contract.totalValue.toLocaleString("vi-VN") : 0} ${contract.currency || "VND"}`,
      "Ngày bắt đầu": formatDate(contract.startDate),
      "Ngày kết thúc": formatDate(contract.endDate),
    },
  };

  return (
    <TemplateDetailLayout {...layoutProps}>
      {/* Content Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          Thông tin chi tiết hợp đồng
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
                <BusinessIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Thông tin doanh nghiệp
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {loadingEnterprise ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải thông tin doanh nghiệp...
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
                        Tên doanh nghiệp
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getEnterpriseName()}
                      </Typography>
                    </Box>
                  </Grid>

                  {enterpriseInfo?.email && (
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
                          {enterpriseInfo.email}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {enterpriseInfo?.phone && (
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
                          {enterpriseInfo.phone}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {enterpriseInfo?.address && (
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
                          {enterpriseInfo.address}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Contract Value & Dates */}
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
                  Giá trị hợp đồng
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
                      Tổng giá trị
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "success.main" }}
                    >
                      {contract.totalValue
                        ? contract.totalValue.toLocaleString("vi-VN")
                        : 0}{" "}
                      {contract.currency || "VND"}
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
                      Loại tiền tệ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {contract.currency || "VND"}
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
                      Ngày bắt đầu
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(contract.startDate)}
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
                      Ngày kết thúc
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(contract.endDate)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* State Management - Only show if can change */}
          {canChangeState(contract.state) && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  Quản lý trạng thái
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chuyển trạng thái sang:
                  </Typography>
                  <Select
                    value={contract.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    size="small"
                    disabled={stateChanging}
                    sx={{ minWidth: 200, borderRadius: 1 }}
                  >
                    <MenuItem value={contract.state} disabled>
                      {getStateLabel(contract.state)} (Hiện tại)
                    </MenuItem>
                    {getAvailableStates(contract.state).map((state) => (
                      <MenuItem key={state} value={state}>
                        {getStateLabel(state)}
                      </MenuItem>
                    ))}
                  </Select>
                  {stateChanging && <CircularProgress size={20} />}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Terms & Conditions */}
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
                <TermsIcon sx={{ fontSize: 20, color: "info.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Điều khoản hợp đồng
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <List disablePadding>
                {contract.paymentTerms && (
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      px: 0,
                      py: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Điều khoản thanh toán
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.8,
                        color: "text.primary",
                      }}
                    >
                      {contract.paymentTerms}
                    </Typography>
                  </ListItem>
                )}

                {contract.guaranteeTerms && (
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      px: 0,
                      py: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Điều khoản bảo hành
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.8,
                        color: "text.primary",
                      }}
                    >
                      {contract.guaranteeTerms}
                    </Typography>
                  </ListItem>
                )}

                {contract.terminationTerms && (
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      px: 0,
                      py: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Điều khoản chấm dứt
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.8,
                        color: "text.primary",
                      }}
                    >
                      {contract.terminationTerms}
                    </Typography>
                  </ListItem>
                )}

                {!contract.paymentTerms &&
                  !contract.guaranteeTerms &&
                  !contract.terminationTerms && (
                    <ListItem sx={{ px: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có điều khoản nào được thiết lập
                      </Typography>
                    </ListItem>
                  )}
              </List>
            </Box>
          </Grid>

          {/* Notes */}
          {contract.notes && (
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
                  {contract.notes}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Attachments */}
          {contract.attachments && contract.attachments.length > 0 && (
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
                  <DescriptionIcon sx={{ fontSize: 20, color: "success.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Tệp đính kèm ({contract.attachments.length})
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {contract.attachments.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        py: 1,
                        borderBottom:
                          index < contract.attachments.length - 1
                            ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                            : "none",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {file.name || `File ${index + 1}`}
                        </Typography>
                        {file.url && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {file.url}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </TemplateDetailLayout>
  );
};

export default SupplierContractDetail;

