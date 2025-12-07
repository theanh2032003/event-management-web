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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Assignment as TaskIcon,
  Receipt as QuoteIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from "@mui/icons-material";
import TemplateDetailLayout from "../../../shared/components/TemplateDetailLayout";
import quoteApi from "../../quote/api/quote.api";
import taskApi from "../../stage/api/task.api";

/**
 * PaymentApprovalDetail - Trang chi tiết phê duyệt thanh toán
 * @param {Object} payment - Dữ liệu phê duyệt thanh toán từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onEdit - Callback khi nhấn nút Edit (optional)
 */
const PaymentApprovalDetail = ({ payment, onBack, onEdit }) => {
  const theme = useTheme();
  const [quoteInfo, setQuoteInfo] = useState(null);
  const [taskInfo, setTaskInfo] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch related quote or task info
  useEffect(() => {
    const fetchRelatedInfo = async () => {
      if (!payment) return;

      try {
        setLoadingRelated(true);

        // Fetch quote if exists
        if (payment.quoteId) {
          try {
            const quoteResponse = await quoteApi.getQuotes({ quoteId: payment.quoteId }, 0, 1);
            const quoteData = quoteResponse?.data || quoteResponse || [];
            if (Array.isArray(quoteData) && quoteData.length > 0) {
              setQuoteInfo(quoteData[0]);
            }
          } catch (error) {
            console.error("[PAYMENT_DETAIL] Error fetching quote:", error);
          }
        }

        // Fetch task if exists
        if (payment.taskId) {
          try {
            const taskResponse = await taskApi.getTasks({ taskId: payment.taskId }, 0, 1);
            const taskData = taskResponse?.data || taskResponse || [];
            if (Array.isArray(taskData) && taskData.length > 0) {
              setTaskInfo(taskData[0]);
            }
          } catch (error) {
            console.error("[PAYMENT_DETAIL] Error fetching task:", error);
          }
        }
      } catch (error) {
        console.error("[PAYMENT_DETAIL] Error fetching related info:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedInfo();
  }, [payment?.quoteId, payment?.taskId]);

  if (!payment) {
    return null;
  }

  // Map state to Vietnamese labels
  const getStateLabel = (state) => {
    const stateMap = {
      DRAFT: "Nháp",
      PENDING_LV1: "Chờ duyệt cấp 1",
      APPROVED_LV1: "Đã duyệt cấp 1",
      REJECTED_LV1: "Từ chối cấp 1",
      PENDING_LV2: "Chờ duyệt cấp 2",
      APPROVED_ALL: "Đã duyệt",
      REJECTED_LV2: "Từ chối cấp 2",
    };
    return stateMap[state] || state;
  };

  // Map state to colors
  const getStateColor = (state) => {
    const colorMap = {
      DRAFT: "default",
      PENDING_LV1: "warning",
      APPROVED_LV1: "info",
      REJECTED_LV1: "error",
      PENDING_LV2: "warning",
      APPROVED_ALL: "success",
      REJECTED_LV2: "error",
    };
    return colorMap[state] || "default";
  };

  // Get type label
  const getTypeLabel = (type) => {
    return type === "QUOTE" ? "Báo Giá" : "Công Việc";
  };

  // Format date to dd/MM/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return amount.toLocaleString("vi-VN");
  };

  // Prepare actions
  const actions = [];
  if (onEdit && payment.state === "DRAFT") {
    actions.push({
      label: "Sửa",
      onClick: onEdit,
      variant: "contained",
      color: "primary",
    });
  }
  actions.push({
    label: "Quay lại",
    onClick: onBack,
    variant: "outlined",
  });

  // Prepare additional info
  const additionalInfo = {
    "Loại": getTypeLabel(payment.type),
    "Ngày tạo": formatDate(payment.createdAt),
  };

  return (
    <TemplateDetailLayout
      title={payment.name}
      status={getStateLabel(payment.state)}
      statusColor={getStateColor(payment.state)}
      createdBy="—"
      actions={actions}
      additionalInfo={additionalInfo}
    >
      <Grid container spacing={3}>
        {/* Payment Amount Section */}
        <Grid item xs={12}>
          <Box
            sx={{
              p: 3,
              backgroundColor: alpha(theme.palette.success.main, 0.06),
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.success.main}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <MoneyIcon sx={{ color: "success.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>
                Số Tiền
              </Typography>
            </Box>
            <Divider sx={{ mb: 2, opacity: 0.3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Tổng Số Tiền
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                  {formatCurrency(payment.amount)}₫
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>

       

        {/* Purpose Section */}
        {payment.purpose && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <DescriptionIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                  Mục Đích
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, opacity: 0.3 }} />
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {payment.purpose}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Approval Level 1 Section */}
        {(payment.userLv1Id || payment.noteLv1 || payment.approvedLv1At) && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                backgroundColor: alpha(
                  payment.state === "REJECTED_LV1" 
                    ? theme.palette.error.main 
                    : theme.palette.info.main, 
                  0.06
                ),
                borderRadius: 2,
                borderLeft: `4px solid ${
                  payment.state === "REJECTED_LV1" 
                    ? theme.palette.error.main 
                    : theme.palette.info.main
                }`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {payment.state === "REJECTED_LV1" ? (
                  <RejectedIcon sx={{ color: "error.main" }} />
                ) : (
                  <ApprovedIcon sx={{ color: "info.main" }} />
                )}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: payment.state === "REJECTED_LV1" ? "error.main" : "info.main" 
                  }}
                >
                  Phê Duyệt Cấp 1
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, opacity: 0.3 }} />
              <Grid container spacing={2}>
                {payment.userLv1Id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Người Duyệt
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      User #{payment.userLv1Id}
                    </Typography>
                  </Grid>
                )}
                {payment.approvedLv1At && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Thời Gian Duyệt
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(payment.approvedLv1At)}
                    </Typography>
                  </Grid>
                )}
                {payment.noteLv1 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Ghi Chú
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {payment.noteLv1}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Approval Level 2 Section */}
        {(payment.userLv2Id || payment.noteLv2 || payment.approvedLv2At) && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                backgroundColor: alpha(
                  payment.state === "REJECTED_LV2" 
                    ? theme.palette.error.main 
                    : theme.palette.success.main, 
                  0.06
                ),
                borderRadius: 2,
                borderLeft: `4px solid ${
                  payment.state === "REJECTED_LV2" 
                    ? theme.palette.error.main 
                    : theme.palette.success.main
                }`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {payment.state === "REJECTED_LV2" ? (
                  <RejectedIcon sx={{ color: "error.main" }} />
                ) : (
                  <ApprovedIcon sx={{ color: "success.main" }} />
                )}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: payment.state === "REJECTED_LV2" ? "error.main" : "success.main" 
                  }}
                >
                  Phê Duyệt Cấp 2
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, opacity: 0.3 }} />
              <Grid container spacing={2}>
                {payment.userLv2Id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Người Duyệt
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      User #{payment.userLv2Id}
                    </Typography>
                  </Grid>
                )}
                {payment.approvedLv2At && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Thời Gian Duyệt
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(payment.approvedLv2At)}
                    </Typography>
                  </Grid>
                )}
                {payment.noteLv2 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Ghi Chú
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {payment.noteLv2}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Timestamps Section */}
        <Grid item xs={12}>
          <Box
            sx={{
              p: 3,
              backgroundColor: alpha(theme.palette.grey[500], 0.06),
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.grey[500]}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CalendarIcon sx={{ color: "text.secondary" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Thời gian cập nhật
              </Typography>
            </Box>
            <Divider sx={{ mb: 2, opacity: 0.3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Ngày Tạo
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(payment.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Cập Nhật Lần Cuối
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(payment.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
         {/* Related Info Section - Quote or Task */}
        {(payment.quoteId || payment.taskId) && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                backgroundColor: alpha(theme.palette.info.main, 0.06),
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.info.main}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {payment.type === "QUOTE" ? (
                  <QuoteIcon sx={{ color: "info.main" }} />
                ) : (
                  <TaskIcon sx={{ color: "info.main" }} />
                )}
                <Typography variant="h6" sx={{ fontWeight: 700, color: "info.main" }}>
                  {payment.type === "QUOTE" ? "Thông Tin Báo Giá" : "Thông Tin Công Việc"}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, opacity: 0.3 }} />
              
              {loadingRelated ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải thông tin...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {payment.type === "QUOTE" && payment.quoteId && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                          Mã Báo Giá
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{payment.quoteId}
                        </Typography>
                      </Grid>
                      {quoteInfo && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                              Tên Báo Giá
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {quoteInfo.name || "—"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                              Giá Cuối Cùng
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                              {formatCurrency(quoteInfo.finalPrice)}₫
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                              Số Lượng
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {quoteInfo.quantity || "—"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                              Phương Thức Thanh Toán
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {quoteInfo.paymentMethod || "—"}
                            </Typography>
                          </Grid>
                          {quoteInfo.paymentTerms && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                                Điều Khoản Thanh Toán
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {quoteInfo.paymentTerms}
                              </Typography>
                            </Grid>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {payment.type === "TASK" && payment.taskId && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                          Mã Công Việc
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{payment.taskId}
                        </Typography>
                      </Grid>
                      {taskInfo && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                            Tên Công Việc
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {taskInfo.name || "—"}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </TemplateDetailLayout>
  );
};

export default PaymentApprovalDetail;
