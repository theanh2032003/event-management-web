import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Grid,
  CircularProgress,
  styled,
  alpha,
  Paper,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ConfirmationNumber as TicketIcon,
  Inbox as InboxIcon,
  Lock as LockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ticketTypeApi from "../api/ticketType.api";
import { useToast } from "../../../app/providers/ToastContext";
import useProjectUserPermissions from "../../permission/hooks/useProjectUserPermissions";
import { formatDateTime } from "../../../shared/utils/dateFormatter";
import CommonTable from "../../../shared/components/CommonTable";

// Styled Components
const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const EmptyStateBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 600,
  padding: theme.spacing(2.5),
}));

/**
 * EventTicketTypeManagement - Quản lý loại vé cho sự kiện
 * API: GET/POST/PUT/DELETE /ticket-types
 */
export default function EventTicketTypeManagement({ enterpriseId, eventId, eventData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toast = useToast();

  // Permission checking
  const [userId, setUserId] = useState(null);
  const { hasPermission, isOwner } = useProjectUserPermissions(eventId, userId);

  // Ticket Types States
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  
  // Inline editing remaining tickets
  const [editingRemainingId, setEditingRemainingId] = useState(null);
  const [editingRemainingValue, setEditingRemainingValue] = useState("");

  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);

  // Form state
  const [ticketForm, setTicketForm] = useState({
    name: "",
    description: "",
    feeType: "FREE",
    price: 0,
    total: 0,
    remaining: 0,
    saleStart: "",
    saleEnd: "",
  });

  // Get current user ID from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // ====== FETCH TICKET TYPES ======
  useEffect(() => {
    if (hasPermission('project_role_manage') || isOwner || eventData?.createdUserId === userId) {
      fetchTicketTypes();
    }
  }, [eventId, hasPermission, isOwner, eventData?.createdUserId, userId]);

  const fetchTicketTypes = async () => {
    try {
      setLoading(true);

      const response = await ticketTypeApi.getTicketTypes(eventId);
      const data = response.data || response;
      
      // API returns array directly
      const ticketList = Array.isArray(data) ? data : [];
      
      setTicketTypes(ticketList);
      setTotalData(ticketList.length);
      
      // Calculate local pagination
      const totalPgs = Math.ceil(ticketList.length / pageSize);
      setTotalPages(totalPgs);
    } catch (err) {
      console.error("❌ Error fetching ticket types:", err);
      if (err.response?.status === 404) {
        setTicketTypes([]);
        setTotalPages(0);
        setTotalData(0);
      } else {
        toast.error("Không thể tải danh sách loại vé");
        setTicketTypes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update totalPages when pageSize changes
  useEffect(() => {
    if (ticketTypes.length > 0) {
      setTotalPages(Math.ceil(ticketTypes.length / pageSize));
    }
  }, [pageSize, ticketTypes.length]);

  // ====== DIALOG HANDLERS ======
  const handleOpenDialog = (ticket = null) => {
    if (ticket) {
      setEditingTicket(ticket);
      // Format datetime for input (remove timezone info to show local time)
      const formatDateTimeLocal = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setTicketForm({
        name: ticket.name || "",
        description: ticket.description || "",
        feeType: ticket.feeType || "FREE",
        price: ticket.price || 0,
        total: ticket.total || 0,
        remaining: ticket.remaining || 0,
        saleStart: formatDateTimeLocal(ticket.saleStart),
        saleEnd: formatDateTimeLocal(ticket.saleEnd),
      });
    } else {
      setEditingTicket(null);
      setTicketForm({
        name: "",
        description: "",
        feeType: "FREE",
        price: 0,
        total: 0,
        remaining: 0,
        saleStart: "",
        saleEnd: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTicket(null);
    setTicketForm({
      name: "",
      description: "",
      feeType: "FREE",
      price: 0,
      total: 0,
      remaining: 0,
      saleStart: "",
      saleEnd: "",
    });
  };

  // ====== SAVE TICKET TYPE ======
  const handleSaveTicket = async () => {
    try {
      setSubmitting(true);

      // Validate form
      if (!ticketForm.name || !ticketForm.name.trim()) {
        toast.error("Vui lòng nhập tên loại vé");
        setSubmitting(false);
        return;
      }

      if (ticketForm.price < 0) {
        toast.error("Giá vé không hợp lệ");
        setSubmitting(false);
        return;
      }

      if (ticketForm.total < 0) {
        toast.error("Số lượng vé không hợp lệ");
        setSubmitting(false);
        return;
      }

      // Format datetime to timestamp without timezone (YYYY-MM-DDTHH:mm:ss)
      const formatToTimestamp = (dateTimeLocal) => {
        if (!dateTimeLocal) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        }
        // Return datetime-local value with seconds appended
        return dateTimeLocal + ':00';
      };

      const requestBody = {
        eventId: parseInt(eventId),
        name: ticketForm.name.trim(),
        description: ticketForm.description.trim(),
        feeType: ticketForm.feeType,
        price: ticketForm.feeType === "FREE" ? 1 : parseFloat(ticketForm.price),
        total: parseInt(ticketForm.total),
        section: null,
        zone: null,
        seatRangeStart: null,
        seatRangeEnd: null,
        saleStart: formatToTimestamp(ticketForm.saleStart),
        saleEnd: formatToTimestamp(ticketForm.saleEnd),
      };

      if (editingTicket) {
        // Update existing ticket type - keep remaining from form
        await ticketTypeApi.updateTicketType(editingTicket.id, {
          ...requestBody,
          id: editingTicket.id,
          remaining: parseInt(ticketForm.remaining),
        });
        toast.success("Cập nhật loại vé thành công!");
      } else {
        // Create new ticket type - remaining equals total initially
        await ticketTypeApi.createTicketType({
          ...requestBody,
          remaining: parseInt(ticketForm.total),
        });
        toast.success("Tạo loại vé mới thành công!");
      }

      handleCloseDialog();
      await fetchTicketTypes();
    } catch (err) {
      console.error("❌ Error saving ticket type:", err);
      console.error("❌ Error response:", err?.response?.data);

      let errorMessage = "Không thể lưu loại vé.";
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ====== DELETE TICKET TYPE ======
  const handleDeleteTicket = async (ticketId) => {
    setDeletingTicketId(ticketId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await ticketTypeApi.deleteTicketType(deletingTicketId);
      toast.success("Xóa loại vé thành công!");
      setDeleteConfirmOpen(false);
      setDeletingTicketId(null);
      await fetchTicketTypes();
    } catch (err) {
      console.error("❌ Error deleting ticket type:", err);
      const message = err.response?.data?.message || "Không thể xóa loại vé";
      toast.error(message);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingTicketId(null);
  };

  // ====== UPDATE REMAINING TICKETS ======
  const handleStartEditRemaining = (ticket) => {
    setEditingRemainingId(ticket.id);
    setEditingRemainingValue(ticket.remaining || ticket.total);
  };

  const handleCancelEditRemaining = () => {
    setEditingRemainingId(null);
    setEditingRemainingValue("");
  };

  const handleSaveRemaining = async (ticketId, maxTotal) => {
    try {
      const newRemaining = parseInt(editingRemainingValue);
      
      if (isNaN(newRemaining) || newRemaining < 0) {
        toast.error("Số lượng vé còn lại không hợp lệ");
        return;
      }

      if (newRemaining > maxTotal) {
        toast.error(`Số lượng vé còn lại không được vượt quá tổng số vé (${maxTotal})`);
        return;
      }

      await ticketTypeApi.updateRemaining(ticketId, newRemaining);
      toast.success("Cập nhật số vé còn lại thành công!");
      
      setEditingRemainingId(null);
      setEditingRemainingValue("");
      await fetchTicketTypes();
    } catch (err) {
      console.error("❌ Error updating remaining:", err);
      const message = err.response?.data?.message || "Không thể cập nhật số vé còn lại";
      toast.error(message);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', m: 2}}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Tạo loại vé mới
        </StyledButton>
      </Box>

      {/* Permission Denied Alert */}
      {!hasPermission('project_role_manage') && !isOwner && eventData?.createdUserId !== userId && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          Bạn không có quyền truy cập loại vé sự kiện này
        </Alert>
      )}

      {/* Content - Only show if has permission */}
      {(hasPermission('project_role_manage') || isOwner || eventData?.createdUserId === userId) ? (
        <>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 8, gap: 2 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Đang tải loại vé...
              </Typography>
            </Box>
          ) : ticketTypes.length === 0 ? (
            <EmptyStateBox>
              <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Chưa có loại vé nào cho sự kiện này
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Hãy tạo mới!
              </Typography>
              <StyledButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Tạo loại vé mới
              </StyledButton>
            </EmptyStateBox>
          ) : isMobile ? (
            // Mobile view: Cards
            <Grid container spacing={2}>
              {ticketTypes.map((ticket) => (
                <Grid item xs={12} key={ticket.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {ticket.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {ticket.description}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            {formatCurrency(ticket.price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Số lượng: {ticket.total} | Còn lại: {ticket.remaining || ticket.total}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => handleOpenDialog(ticket)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteTicket(ticket.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Desktop view: CommonTable
            <CommonTable
              columns={[
                {
                  field: 'stt',
                  headerName: 'STT',
                  width: 70,
                  align: 'center',
                  headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
                  cellSx: { fontSize: '0.9rem', textAlign: 'center', height: '80px' },
                  render: (value, row, rowIndex) => rowIndex + 1,
                },
                {
                  field: 'name',
                  headerName: 'Tên',
                  flex: 1.2,
                  render: (value) => (
                    <Typography variant="body2" color="text.primary">
                      {value}
                    </Typography>
                  ),
                },
                {
                  field: 'description',
                  headerName: 'Mô tả',
                  flex: 1.5,
                  render: (value) => (
                    <Typography variant="body2" color="text.primary">
                      {value || "-"}
                    </Typography>
                  ),
                },
                {
                  field: 'price',
                  headerName: 'Giá vé',
                  flex: 1,
                  render: (value) => (
                    <Typography variant="body2" color="text.primary">
                      {formatCurrency(value)}
                    </Typography>
                  ),
                },
                {
                  field: 'total',
                  headerName: 'Số lượng',
                  flex: 0.8,
                  render: (value) => (
                    <Typography variant="body2" color="text.primary">
                      {value}
                    </Typography>
                  ),
                },
                {
                  field: 'remaining',
                  headerName: 'Còn lại',
                  flex: 0.8,
                  render: (value, row) => {
                    const displayValue = value || row.total;
                    return editingRemainingId === row.id ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={editingRemainingValue}
                          onChange={(e) => setEditingRemainingValue(e.target.value)}
                          inputProps={{ min: 0, max: row.total, style: { padding: '4px 8px' } }}
                          sx={{ width: 80 }}
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveRemaining(row.id, row.total);
                            }
                          }}
                        />
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleSaveRemaining(row.id, row.total)}
                          sx={{ padding: '4px' }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={handleCancelEditRemaining}
                          sx={{ padding: '4px' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "action.hover",
                            borderRadius: 1,
                          },
                          padding: "4px 8px",
                          marginLeft: "-8px",
                        }}
                        onClick={() => handleStartEditRemaining(row)}
                      >
                        <Typography variant="body2" color="text.primary">
                          {displayValue}
                        </Typography>
                        <EditIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.5 }} />
                      </Box>
                    );
                  },
                },
                {
                  field: 'saleStart',
                  headerName: 'Mở bán',
                  flex: 1.2,
                  render: (value) => (
                    <Typography variant="body2" color="text.primary">
                      {value ? formatDateTime(value) : "-"}
                    </Typography>
                  ),
                },
                {
                  field: 'saleEnd',
                  headerName: 'Kết thúc',
                  flex: 1.2,
                  render: (value) => (
                    <Typography variant="body2" color="text.primary">
                      {value ? formatDateTime(value) : "-"}
                    </Typography>
                  ),
                },
                {
                  field: 'actions',
                  headerName: 'Hành động',
                  flex: 0.9,
                  align: 'right',
                  render: (value, row) => (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTicket(row.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ),
                },
              ]}
              data={ticketTypes}
              loading={loading}
              rowsPerPage={pageSize}
              page={page}
              totalCount={ticketTypes.length}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(0);
              }}
              emptyMessage="Không có loại vé nào"
              maxHeight={600}
              minHeight={600}
            />
          )}

          {/* Ticket Type Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
          >
            <StyledDialogTitle   sx={{
              textAlign: 'center',     // căn giữa
              fontWeight: 700,         // in đậm
              fontSize: '20px',        // cỡ chữ
            }}>
              {editingTicket ? "Chỉnh sửa loại vé" : "Tạo loại vé mới"}
            </StyledDialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>

                {/* Tên loại vé */}
                <TextField
                  label="Tên loại vé"
                  fullWidth
                  required
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  disabled={submitting}
                  placeholder="Nhập tên loại vé"
                />

                {/* Mô tả */}
                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  disabled={submitting}
                  placeholder="Mô tả chi tiết về loại vé"
                />

                {/* Loại phí + Giá vé + Số lượng vé + Thời gian mở bán + Kết thúc */}
                <Grid container spacing={2}>
                  {/* Row 1: Loại (3) + Giá vé (6) + Số lượng vé (3) */}
                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      select
                      label="Loại"
                      fullWidth
                      required
                      value={ticketForm.feeType}
                      onChange={(e) => setTicketForm({ ...ticketForm, feeType: e.target.value })}
                      disabled={submitting}
                    >
                      <MenuItem value="FREE">Miễn phí</MenuItem>
                      <MenuItem value="PAID">Trả tiền</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={8} md={6}>
                    <TextField
                      label="Giá vé (VNĐ)"
                      type="number"
                      fullWidth
                      required
                      value={ticketForm.price}
                      onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                      disabled={submitting || ticketForm.feeType === "FREE"}
                      inputProps={{ min: 0, step: 1000 }}
                      placeholder={ticketForm.feeType === "FREE" ? "Miễn phí" : "Nhập giá vé"}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      label="Số lượng vé"
                      type="number"
                      fullWidth
                      required
                      value={ticketForm.total}
                      onChange={(e) => {
                        const newTotal = e.target.value;
                        setTicketForm({ 
                          ...ticketForm, 
                          total: newTotal,
                          ...(!editingTicket && { remaining: newTotal })
                        });
                      }}
                      disabled={submitting}
                      inputProps={{ min: 0 }}
                      placeholder="Nhập số lượng"
                    />
                  </Grid>

                  {/* Row 2: Thời gian mở bán (6) + Thời gian kết thúc (6) */}
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label="Thời gian mở bán"
                      type="datetime-local"
                      fullWidth
                      required
                      value={ticketForm.saleStart}
                      onChange={(e) => setTicketForm({ ...ticketForm, saleStart: e.target.value })}
                      disabled={submitting}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label="Thời gian kết thúc"
                      type="datetime-local"
                      fullWidth
                      required
                      value={ticketForm.saleEnd}
                      onChange={(e) => setTicketForm({ ...ticketForm, saleEnd: e.target.value })}
                      disabled={submitting}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <Divider />
            <DialogActions>
              <Button 
                onClick={handleCloseDialog} 
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveTicket}
                variant="contained"
                disabled={submitting || !ticketForm.name.trim()}
              >
                {submitting ? "Đang lưu..." : (editingTicket ? "Lưu" : "Hoàn thành")}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>
              Xác nhận xóa
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Typography variant="body1">
                Bạn có chắc chắn muốn xóa loại vé này? Hành động này không thể hoàn tác.
              </Typography>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ gap: 1, p: 2 }}>
              <Button 
                onClick={handleCancelDelete}
                variant="outlined"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Xóa
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Box>
  );
}
