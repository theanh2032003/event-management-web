import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  alpha,
  IconButton,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem as MenuItemComponent,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Inbox as InboxIcon,
  Lock as LockIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from "@mui/icons-material";
import axiosClient from "../../../app/axios/axiosClient";
import useProjectUserPermissions from "../../permission/hooks/useProjectUserPermissions";
import { useToast } from "../../../app/providers/ToastContext";
import ScheduleDialog from "../components/ScheduleDialog";
import ScheduleDetailDialog from "../components/ScheduleDetailDialog";
import { formatDateTime, parseDateTimeLocal } from "../../../shared/utils/dateFormatter";

// Styled Components
const ScheduleContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  padding: theme.spacing(2),
}));

const ScheduleListBox = styled(Box)(({ theme }) => ({
  height: '500px',
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '4px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const ScheduleItemBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  background: theme.palette.background.paper,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: 4,
  gap: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
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


export default function EventSchedule({ eventData, onRefresh }) {
  const { id: enterpriseId, eventId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const toast = useToast();

  // Get userId for permission checking
  const [userId, setUserId] = useState(null);

  // Fetch user permissions for this project/event
  const { hasPermission, isOwner } = useProjectUserPermissions(eventId, userId);

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

  // ====== STATES ======
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [parentSchedule, setParentSchedule] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedScheduleForMenu, setSelectedScheduleForMenu] = useState(null);

  // ====== FETCH SCHEDULES ======
  useEffect(() => {
    // ✅ Chỉ fetch nếu user có quyền project_schedule_manage
    if (hasPermission('project_schedule_manage') || isOwner || eventData?.createdUserId === userId) {
      fetchSchedules();
    }
  }, [eventId, hasPermission, isOwner, eventData?.createdUserId, userId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token không tồn tại. Vui lòng đăng nhập lại.");
        return;
      }

      const userId = getCurrentUserId();

      const response = await axiosClient.get(`/project/${eventId}/schedule`, {
        params: {
          page: 0,
          size: 1000, // Get all schedules
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "enterprise-id": enterpriseId,
          "user-id": userId,
        },
      });

      const data = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.content || [];
      setSchedules(data);
    } catch (err) {
      toast.error(
        "Không thể tải danh sách lịch trình. " +
          (err?.response?.data?.message || err.message || "")
      );
    } finally {
      setLoading(false);
    }
  };

  // ====== HELPER: Get current user ID ======
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || "";
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    return "";
  };

  // ====== DIALOG HANDLERS ======
  const handleOpenDialog = (schedule = null, parent = null) => {
    setEditingSchedule(schedule);
    setParentSchedule(parent);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    if (!submitting) {
      setDialogOpen(false);
      setEditingSchedule(null);
      setParentSchedule(null);
    }
  };

  // ====== CREATE/UPDATE SCHEDULE ======
  const handleSaveSchedule = async (scheduleForm, scheduleId) => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const userId = getCurrentUserId();

      const payload = {
        ...scheduleForm,
        startedAt: parseDateTimeLocal(scheduleForm.startedAt),
        endedAt: parseDateTimeLocal(scheduleForm.endedAt),
      };

      if (scheduleId) {
        // UPDATE
        await axiosClient.put(
          `/project/${eventId}/schedule/${scheduleId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "enterprise-id": enterpriseId,
              "user-id": userId,
            },
          }
        );

        toast.success("Cập nhật lịch trình thành công!");
      } else {
        // CREATE
        await axiosClient.post(
          `project/${eventId}/schedule`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "enterprise-id": enterpriseId,
              "user-id": userId,
            },
          }
        );

        toast.success(
          payload.parentId 
            ? "Tạo lịch trình con thành công!" 
            : "Tạo lịch trình chính thành công!"
        );
      }

      // Refresh list
      await fetchSchedules();

      // Close dialog
      handleCloseDialog();

      // Call parent refresh if exists
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("❌ Error saving schedule:", err);
      toast.error(
        err?.response?.data?.message || 
        `Không thể ${scheduleId ? "cập nhật" : "tạo"} lịch trình. Vui lòng thử lại.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ====== DELETE SCHEDULE ======
  const handleOpenDeleteDialog = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const userId = getCurrentUserId();

      await axiosClient.delete(
        `/project/${eventId}/schedule/${scheduleToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "enterprise-id": enterpriseId,
            "user-id": userId,
          },
        }
      );

      // Close delete dialog
      handleCloseDeleteDialog();

      // Refresh list
      await fetchSchedules();

      // Show success message
      toast.success("Xóa lịch trình thành công!");

      // Call parent refresh if exists
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("❌ Error deleting schedule:", err);
      toast.error(
        err?.response?.data?.message || 
        "Không thể xóa lịch trình. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuOpen = (event, schedule) => {
    setAnchorEl(event.currentTarget);
    setSelectedScheduleForMenu(schedule);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedScheduleForMenu(null);
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Get parent schedules (API returns them with children array included)
  const parentSchedules = schedules;

  // ====== RENDER ======
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%' }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 2 }}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          {isMobile ? "Thêm" : "Thêm lịch trình"}
        </StyledButton>
      </Box>

      {/* Permission Denied Alert */}
      {!hasPermission('project_schedule_manage') && !isOwner && eventData?.createdUserId !== userId && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2, mx: 2, borderRadius: 2 }}>
          Bạn không có quyền truy cập lịch trình sự kiện này
        </Alert>
      )}

      {/* Content - Only show if has permission */}
      {(hasPermission('project_schedule_manage') || isOwner || eventData?.createdUserId === userId) ? (
        <Box sx={{ px: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, gap: 2 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Đang tải lịch trình...
              </Typography>
            </Box>
          ) : parentSchedules.length === 0 ? (
            <EmptyStateBox>
              <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Chưa có lịch trình nào
              </Typography>
            </EmptyStateBox>
          ) : (
            <ScheduleContainer>
              <ScheduleListBox>
                {parentSchedules.map((schedule) => {
                  const childSchedules = schedule.children || [];
                  const isExpanded = expandedIds.has(schedule.id);

                  return (
                    <Box key={schedule.id} sx={{ mb: 1 }}>
                      {/* Parent Schedule */}
                      <ScheduleItemBox>
                        {/* Expand/Collapse Icon */}
                        {childSchedules.length > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => toggleExpanded(schedule.id)}
                            sx={{ 
                              p: 0, 
                              minWidth: 32,
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            {isExpanded ? (
                              <KeyboardArrowDownIcon fontSize="small" />
                            ) : (
                              <KeyboardArrowRightIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}
                        {childSchedules.length === 0 && <Box sx={{ width: 32 }} />}

                        {/* Title + Time */}
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight={600} sx={{ mr: 4, fontSize: '1rem' }} >
                            {schedule.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{color: '#000000ff', fontSize: '1rem'}}>
                            {formatDateTime(schedule.startedAt)} - {formatDateTime(schedule.endedAt)}
                          </Typography>
                        </Box>

                        {/* More Menu */}
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, schedule)}
                          sx={{ p: 0.5 }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </ScheduleItemBox>

                      {/* Children */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        {childSchedules.map((child) => (
                          <ScheduleItemBox
                            key={child.id}
                            sx={{
                              ml: 4,
                              pl: 3,
                              borderLeft: '3px solid',
                              borderLeftColor: 'primary.main',
                              backgroundColor: alpha(theme.palette.primary.main, 0.02),
                            }}
                          >
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={500} sx={{ mr: 4, fontSize: '1rem' }}>
                                {child.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{color: '#000000ff', fontSize: '1rem'}}>
                                {formatDateTime(child.startedAt)} - {formatDateTime(child.endedAt)}
                              </Typography>
                            </Box>

                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, child)}
                              sx={{ p: 0.5 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </ScheduleItemBox>
                        ))}
                      </Collapse>
                    </Box>
                  );
                })}
              </ScheduleListBox>
            </ScheduleContainer>
          )}

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItemComponent
              onClick={() => {
                handleOpenDialog(selectedScheduleForMenu);
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Sửa
            </MenuItemComponent>

            {!selectedScheduleForMenu?.parentId && (
              <MenuItemComponent
                onClick={() => {
                  handleOpenDialog(null, selectedScheduleForMenu);
                }}
              >
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                Thêm lịch trình con
              </MenuItemComponent>
            )}

            <MenuItemComponent
              onClick={() => {
                handleOpenDeleteDialog(selectedScheduleForMenu);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Xóa
            </MenuItemComponent>
          </Menu>

          {/* Create/Edit Schedule Dialog */}
          <ScheduleDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            schedule={editingSchedule}
            parentSchedule={parentSchedule}
            onSave={handleSaveSchedule}
            submitting={submitting}
            isMobile={isMobile}
            enterpriseId={enterpriseId}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogContent>
              <Typography>
                Bạn có chắc chắn muốn xóa lịch trình <strong>"{scheduleToDelete?.title}"</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Hành động này không thể hoàn tác.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDeleteDialog}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
                disabled={submitting}
                startIcon={<DeleteIcon />}
              >
                {submitting ? "Đang xóa..." : "Xóa"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : null}
    </Box>
  );
}
