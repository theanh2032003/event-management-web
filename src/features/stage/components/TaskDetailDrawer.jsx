import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Stack,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Divider,
  styled,
  alpha,
  CircularProgress,
  useTheme,
  FormControl,
  Select,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { formatDateTime } from "../../../shared/utils/dateFormatter";
import taskApi from "../api/task.api";

// Styled Components
const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflow: "auto",
  height: "calc(100vh - 80px)",
}));

const SectionCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  overflow: "hidden",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.95rem",
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const FieldBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:last-child": {
    borderBottom: "none",
    marginBottom: 0,
    paddingBottom: 0,
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.85rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}));

const Value = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.primary,
}));

const ImageGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
}));

const ImageThumbnail = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: theme.spacing(1),
  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
    borderColor: theme.palette.primary.main,
  },
}));

const PersonnelItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.action.hover, 0.5),
  marginBottom: theme.spacing(1),
  "&:last-child": {
    marginBottom: 0,
  },
}));

/**
 * TaskDetailDrawer - Hiển thị chi tiết công việc ở drawer bên phải
 */
export default function TaskDetailDrawer({
  open,
  onClose,
  task,
  stageName,
  onEdit,
  onDelete,
  users = [],
  taskTypes = [],
  taskStates = [],
  onChangeStatus,
}) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [statusDropdownValue, setStatusDropdownValue] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State for task detail
  const [taskDetail, setTaskDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Fetch task detail when task changes
  useEffect(() => {
    if (open && task?.id) {
      fetchTaskDetail(task.id);
    } else {
      setTaskDetail(null);
      setDetailError(null);
    }
  }, [open, task?.id]);

  const fetchTaskDetail = async (taskId) => {
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const response = await taskApi.getById(taskId);
      const detail = response.data || response.data?.data || response;
      console.log("📋 Task detail fetched:", detail);
      setTaskDetail(detail);
    } catch (err) {
      console.error("❌ Error fetching task detail:", err);
      setDetailError("Không thể tải chi tiết công việc");
      // Fallback to task from props if fetch fails
      setTaskDetail(task);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Reset states khi drawer đóng
  const handleDrawerClose = () => {
    setMenuAnchor(null);
    setStatusDropdownValue('');
    setDeleteConfirmOpen(false);
    setEditFormOpen(false);
    setEditFormData(null);
    setTaskDetail(null);
    setDetailError(null);
    onClose();
  };

  // Task status options - PENDING, IN_PROGRESS, DONE, CANCELED
  const taskStatusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
    { value: 'DONE', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Hủy bỏ' },
  ];

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    if (onChangeStatus) {
      await onChangeStatus(taskDetail || task, newStatus);
      // Refresh task detail after status update
      if (taskId) {
        fetchTaskDetail(taskId);
      }
    }
  };

  // Initialize edit form data
  const handleOpenEditForm = () => {
    const currentTask = taskDetail || task;
    setEditFormData({
      name: currentTask?.name || "",
      description: currentTask?.description || "",
      taskTypeId: currentTask?.taskTypeId || "",
      stateId: currentTask?.state?.id || "",
      implementerIds: currentTask?.implementers?.map((p) => p.id) || [],
      supporterIds: currentTask?.supporters?.map((p) => p.id) || [],
      testerIds: currentTask?.testers?.map((p) => p.id) || [],
      supplierId: currentTask?.supplier?.id || "",
    });
    setEditFormOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !task) return;

    setSubmitting(true);
    try {
      await onEdit(task, editFormData);
      setEditFormOpen(false);
      setEditFormData(null);
      // Refresh task detail after edit
      if (task.id) {
        fetchTaskDetail(task.id);
      }
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setMenuAnchor(null);
    await onDelete(task);
  };

  if (!task) return null;

  // Use taskDetail if loaded, otherwise fallback to task from props
  const displayTask = taskDetail || task;

  // Get supplier info
  const supplierName = displayTask.supplier?.name || "Chưa chỉ định";

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "500px", md: "600px" },
            backgroundColor: "#fafafa",
            zIndex: 1400,
          },
        }}
        ModalProps={{ sx: { zIndex: 1399 } }}
      >
        {/* Header */}
        <DrawerHeader sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700} fontSize="1.25rem">
            Chi tiết công việc
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: "text.secondary", "&:hover": { backgroundColor: alpha("#000", 0.05) } }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </DrawerHeader>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          sx={{
            zIndex: 1604,
          }}
          PaperProps={{
            sx: {
              mt: 1,
              "& .MuiMenuItem-root": { px: 2, py: 1 },
            },
          }}
        >
          <MenuItem onClick={handleOpenEditForm}>
            <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Sửa
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setDeleteConfirmOpen(true);
              setMenuAnchor(null);
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Xóa
          </MenuItem>
        </Menu>

        {/* Content */}
        <DrawerContent sx={{ pt: 0 }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : detailError ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error" variant="body2">{detailError}</Typography>
              <Button onClick={() => fetchTaskDetail(task.id)} sx={{ mt: 2 }}>
                Thử lại
              </Button>
            </Box>
          ) : (
            <>
          <Box sx={{ mb: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {displayTask.name}
              </Typography>

              {/* Dropdown chuyển trạng thái */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={statusDropdownValue || (typeof displayTask.state === 'string' ? displayTask.state : (displayTask.state?.code || ''))}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    setStatusDropdownValue(newStatus);
                    // gọi API update trạng thái
                    await updateTaskStatus(displayTask.id, newStatus);
                  }}
                  MenuProps={{
                    sx: { zIndex: 1605 },
                    PaperProps: {
                      sx: { zIndex: 1605 }
                    }
                  }}
                >
                  {taskStatusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Stack spacing={0.5} mt={1}>
              <Typography variant="subtitle2" fontWeight={600} fontSize="0.9rem">
                Loại công việc: {displayTask.taskType?.name || "-"}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} fontSize="0.9rem">
                Giai đoạn: {stageName || "-"}
              </Typography>
            </Stack>
          </Box>

          {/* Dates */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="caption" fontWeight={600} fontSize="0.8rem" color="text.secondary">
                  NGÀY TẠO
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} fontSize="0.95rem" mt={0.5}>
                  {formatDateTime(displayTask.createdAt) || "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={600} fontSize="0.8rem" color="text.secondary">
                  NGÀY SỬA
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} fontSize="0.95rem" mt={0.5}>
                  {formatDateTime(displayTask.updatedAt) || "-"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" fontWeight={600} fontSize="0.8rem" color="text.secondary">
                  NGÀY BẮT ĐẦU
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} fontSize="0.95rem" mt={0.5}>
                  {formatDateTime(displayTask.startedAt) || "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={600} fontSize="0.8rem" color="text.secondary">
                  HẠN CHÓT
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} fontSize="0.95rem" mt={0.5}>
                  {formatDateTime(displayTask.endedAt) || "-"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Personnel */}
          {(displayTask.implementers?.length > 0 || displayTask.supporters?.length > 0 || displayTask.testers?.length > 0) && (
            <Box sx={{ mb: 2 }}>
              {/* Implementers */}
              {displayTask.implementers?.length > 0 && (
                <FieldBox sx={{ borderBottom: 'none', mb: 1 }}>
                  <Label sx={{ fontSize: "0.9rem", fontWeight: 600 }}>Người thực hiện</Label>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {displayTask.implementers.map((person) => (
                      <Box
                        key={person.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          borderRadius: "16px",
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <Avatar src={person.avatar} sx={{ width: 28, height: 28 }}>
                          {person.name?.charAt(0) || "?"}
                        </Avatar>
                        <Typography variant="caption" fontWeight={500} fontSize="0.8rem">
                          {person.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </FieldBox>
              )}

              {/* Supporters */}
              {displayTask.supporters?.length > 0 && (
                <FieldBox sx={{ borderBottom: 'none', mb: 1 }}>
                  <Label sx={{ fontSize: "0.9rem", fontWeight: 600 }}>Đồng tác viên</Label>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {displayTask.supporters.map((person) => (
                      <Box
                        key={person.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: alpha(theme.palette.info.main, 0.08),
                          borderRadius: "16px",
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                      >
                        <Avatar src={person.avatar} sx={{ width: 28, height: 28 }}>
                          {person.name?.charAt(0) || "?"}
                        </Avatar>
                        <Typography variant="caption" fontWeight={500} fontSize="0.8rem">
                          {person.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </FieldBox>
              )}

              {/* Testers */}
              {displayTask.testers?.length > 0 && (
                <FieldBox sx={{ mb: 1 }}>
                  <Label sx={{ fontSize: "0.9rem", fontWeight: 600 }}>Người kiểm tra</Label>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {displayTask.testers.map((person) => (
                      <Box
                        key={person.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: alpha(theme.palette.warning.main, 0.08),
                          borderRadius: "16px",
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        }}
                      >
                        <Avatar src={person.avatar} sx={{ width: 28, height: 28 }}>
                          {person.name?.charAt(0) || "?"}
                        </Avatar>
                        <Typography variant="caption" fontWeight={500} fontSize="0.8rem">
                          {person.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </FieldBox>
              )}
            </Box>
          )}

          {/* Supplier */}
          <Box sx={{ mb: 2 }}>
            <SectionTitle sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 1 }}>Nhà cung cấp</SectionTitle>
            <Value sx={{ fontSize: "0.875rem" }}>{supplierName || ""}</Value>
          </Box>

          {/* Description */}
          <Box sx={{ mb: 2 }}>
            <SectionTitle sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 1 }}>Mô tả công việc</SectionTitle>
            <Value sx={{ fontSize: "0.875rem", whiteSpace: "pre-line" }}>{displayTask.description || ""}</Value>
          </Box>

          {/* Attachments */}
          {displayTask.images?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <SectionTitle sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 1 }}>Tệp đính kèm</SectionTitle>
              <ImageGrid>
                {displayTask.images.map((image, idx) => (
                  <ImageThumbnail key={idx} src={image.url || image} alt={`Attachment ${idx + 1}`} />
                ))}
              </ImageGrid>
            </Box>
          )}
            </>
          )}

        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        sx={{
          zIndex: 9999,
        }}
        BackdropProps={{
          sx: { zIndex: 9998 }
        }}
        PaperProps={{
          sx: { zIndex: 9999 }
        }}
      >
        <DialogTitle>Xác nhận xóa công việc</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa công việc "{task.name}"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog 
        open={editFormOpen} 
        onClose={() => setEditFormOpen(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          zIndex: 9999,
        }}
        BackdropProps={{
          sx: { zIndex: 9998 }
        }}
        PaperProps={{
          sx: { zIndex: 9999 }
        }}
      >
        <DialogTitle>Chỉnh sửa công việc</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editFormData && (
            <Stack spacing={2}>
              {/* Name */}
              <TextField
                label="Tên công việc"
                fullWidth
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                variant="outlined"
                size="small"
              />

              {/* Description */}
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                variant="outlined"
                size="small"
              />

              {/* Task Type */}
              <Autocomplete
                options={taskTypes}
                getOptionLabel={(option) => option.name}
                value={taskTypes.find((t) => t.id === editFormData.taskTypeId) || null}
                onChange={(e, value) =>
                  setEditFormData({
                    ...editFormData,
                    taskTypeId: value?.id || "",
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Loại công việc" size="small" />
                )}
              />

              {/* State */}
              <Autocomplete
                options={taskStates}
                getOptionLabel={(option) => option.name}
                value={taskStates.find((s) => s.id === editFormData.stateId) || null}
                onChange={(e, value) =>
                  setEditFormData({
                    ...editFormData,
                    stateId: value?.id || "",
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Trạng thái" size="small" />
                )}
              />

              {/* Implementers */}
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.name}
                value={users.filter((u) => editFormData.implementerIds?.includes(u.id)) || []}
                onChange={(e, value) =>
                  setEditFormData({
                    ...editFormData,
                    implementerIds: value.map((v) => v.id),
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Người thực hiện" size="small" />
                )}
              />

              {/* Supporters */}
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.name}
                value={users.filter((u) => editFormData.supporterIds?.includes(u.id)) || []}
                onChange={(e, value) =>
                  setEditFormData({
                    ...editFormData,
                    supporterIds: value.map((v) => v.id),
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Người hỗ trợ" size="small" />
                )}
              />

              {/* Testers */}
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.name}
                value={users.filter((u) => editFormData.testerIds?.includes(u.id)) || []}
                onChange={(e, value) =>
                  setEditFormData({
                    ...editFormData,
                    testerIds: value.map((v) => v.id),
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Người kiểm tra" size="small" />
                )}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFormOpen(false)}>Hủy</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
