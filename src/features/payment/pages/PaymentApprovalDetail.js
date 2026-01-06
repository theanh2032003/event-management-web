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
  Table,
  TableBody,
  TableCell,
  TableRow,
  Card,
  CardContent,
  Stack,
  Button,
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
          }
        }

        // Fetch task if exists
        if (payment.taskId) {
          try {
            const taskResponse = await taskApi.getById(payment.taskId);
            const taskData = taskResponse?.data || taskResponse;
            if (taskData) {
              setTaskInfo(taskData);
            }
          } catch (error) {
          }
        }
      } catch (error) {
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
      title={`Phiếu duyệt chi ${payment.name}`}
      actions={actions}
    >
      <Stack spacing={3}>
        {/* ============ THÔNG TIN CHUNG ============ */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>THÔNG TIN CHUNG</Typography>
          </Box>
          <Table size="small" sx={{ '& td': { py: 1.2 } }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: '200px', fontWeight: 600, color: 'text.secondary' }}>Loại phiếu</TableCell>
                <TableCell>Phiếu duyệt chi {getTypeLabel(payment.type)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '200px', fontWeight: 600, color: 'text.secondary' }}>Sự kiện</TableCell>
                <TableCell>{payment?.projectName || "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '200px', fontWeight: 600, color: 'text.secondary' }}>Người tạo</TableCell>
                <TableCell>{payment.createdUser.name || "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Ngày tạo</TableCell>
                <TableCell>{formatDate(payment.createdAt)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Trạng thái</TableCell>
                <TableCell>
                  <Chip label={getStateLabel(payment.state)} color={getStateColor(payment.state)} size="small" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ opacity: 0.3 }} />

        {/* ============ THÔNG TIN KHOẢN CHI ============ */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>THÔNG TIN KHOẢN CHI</Typography>
          </Box>
          <Table size="small" sx={{ '& td': { py: 1.2 } }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: '200px', fontWeight: 600, color: 'text.secondary' }}>Số tiền đề nghị</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.main', fontSize: '1.1rem' }}>
                    {formatCurrency(payment.amount)}₫
                  </Typography>
                </TableCell>
              </TableRow>
              {payment.purpose && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', verticalAlign: 'top' }}>Mục đích chi</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {payment.purpose}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ opacity: 0.3 }} />

        {/* ============ ĐỐI TƯỢNG CHI (BÁOO GIÁ / CÔNG VIỆC) ============ */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              ĐỐI TƯỢNG CHI: {payment.type === "QUOTE" ? "BÁO GIÁ" : "CÔNG VIỆC"}
            </Typography>
          </Box>
          
          {loadingRelated ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">Đang tải thông tin...</Typography>
            </Box>
          ) : payment.type === "QUOTE" ? (
            <Box>
              <Table size="small" sx={{ '& td': { py: 1.2 } }}>
                <TableBody>
                  {quoteInfo && (
                    <>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Tên báo giá</TableCell>
                        <TableCell>{quoteInfo.name || "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Số lượng</TableCell>
                        <TableCell>{quoteInfo.quantity || "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Tổng giá</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.main' }}>
                            {formatCurrency(quoteInfo.finalPrice)}₫
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {quoteInfo.paymentMethod && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Phương thức TT</TableCell>
                          <TableCell>{quoteInfo.paymentMethod}</TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box>
              <Table size="small" sx={{ '& td': { py: 1.2 } }}>
                <TableBody>
                  {taskInfo ? (
                    <>
                      <TableRow>
                        <TableCell sx={{ width: '200px', fontWeight: 600, color: 'text.secondary' }}>Tên công việc</TableCell>
                        <TableCell>{taskInfo.name || "—"}</TableCell>
                      </TableRow>
                     
                    </>
                  ) : (
                    <TableRow>
                      <TableCell sx={{ width: '200px', fontWeight: 600, color: 'text.secondary' }}>Công việc ID</TableCell>
                      <TableCell>{payment.taskId}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>

        <Divider sx={{ opacity: 0.3 }} />

        {/* ============ QUY TRÌNH DUYỆT ============ */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>QUY TRÌNH DUYỆT</Typography>
          </Box>

          <Stack spacing={3} sx={{ pl: 2 }}>
            {/* NGƯỜI ĐỀ XUẤT */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ApprovedIcon sx={{ color: 'success.main', fontSize: 24 }} />
                  <Box sx={{ width: 2, height: 40, backgroundColor: alpha(theme.palette.divider, 0.5), my: 1 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Người đề xuất</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {payment?.createdUser.name || "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {formatDate(payment.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* LV1 APPROVAL - LUÔN HIỂN THỊ */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {payment.state === "REJECTED_LV1" ? (
                    <RejectedIcon sx={{ color: 'error.main', fontSize: 24 }} />
                  ) : payment.approvedLv1At ? (
                    <ApprovedIcon sx={{ color: 'success.main', fontSize: 24 }} />
                  ) : (
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${alpha(theme.palette.divider, 0.5)}` }} />
                  )}
                  <Box sx={{ width: 2, height: 40, backgroundColor: alpha(theme.palette.divider, 0.5), my: 1 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Duyệt cấp 1</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {payment?.projectOwnerName || "—"}
                      </Typography>
                  {payment.approvedLv1At && (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {formatDate(payment.approvedLv1At)}
                      </Typography>
                      {payment.noteLv1 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}>
                          Ghi chú: {payment.noteLv1}
                        </Typography>
                      )}
                    </>
                  )}
                  {!payment.approvedLv1At && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {payment.userLv1Id ? "Chưa thực hiện" : ""}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* LV2 APPROVAL */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {payment.state === "REJECTED_LV2" ? (
                    <RejectedIcon sx={{ color: 'error.main', fontSize: 24 }} />
                  ) : payment.approvedLv2At ? (
                    <ApprovedIcon sx={{ color: 'success.main', fontSize: 24 }} />
                  ) : (
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${alpha(theme.palette.divider, 0.5)}` }} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Duyệt cấp 2</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {payment?.enterpriseOwnerName || "—"}
                      </Typography>  
                  {payment.approvedLv2At && (
                    <> 
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {formatDate(payment.approvedLv2At)}
                      </Typography>
                      {payment.noteLv2 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}>
                          Ghi chú: {payment.noteLv2}
                        </Typography>
                      )}
                    </>
                  )}
                  {!payment.approvedLv2At && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {payment.userLv2Id ? "Chưa thực hiện" : ""}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

          </Stack>
        </Box>

        {/* ============ GHI CHÚ KHÁC ============ */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>GHI CHÚ KHÁC</Typography>
          </Box>
          <Typography variant="body2">—</Typography>
        </Box>
      </Stack>
    </TemplateDetailLayout>
  );
};

export default PaymentApprovalDetail;
