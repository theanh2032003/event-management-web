import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Alert,
  Chip,
  styled,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import axiosClient from "../../../app/axios/axiosClient";
import PermissionGate from "../../../shared/components/PermissionGate";
import { CommonTable } from "../../../shared/components/CommonTable";
import CommonDialog from "../../../shared/components/CommonDialog";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";
import groupTaskStateApi from "../api/groupTaskStateApi";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      fontWeight: 700,
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateY(-1px)',
        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
      '&:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(2),
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2.5),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

/**
 * TaskStateManagement - Quản lý trạng thái công việc (Group Task State & Task State)
 * API Group: GET/POST/PUT/DELETE /group-task-state
 * API State: GET/POST/PUT/DELETE /group-task-state/{groupId}/task-state
 * 
 * Props:
 * - enterpriseId: ID của doanh nghiệp
 * - userPermissions: Danh sách quyền của user
 * - hasPermission: Function kiểm tra xem user có quyền cụ thể
 * - requiredPermission: Mã quyền cần để truy cập tab này
 */
export default function TaskStateManagement({ 
  enterpriseId,
  userPermissions = [],
  hasPermission = () => true,
  requiredPermission = PERMISSION_CODES.TASK_STATE_MANAGE
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Kiểm tra quyền của user
  const hasAccessPermission = hasPermission(requiredPermission);
  
  // Group Task State States
  const [taskStateGroups, setTaskStateGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ 
    name: "", 
    description: ""
  });

  // Delete Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ====== GROUP TASK STATE FUNCTIONS ======

  // Fetch danh sách nhóm trạng thái
  useEffect(() => {
    // Chỉ fetch nếu user có quyền
    if (hasAccessPermission) {
      fetchTaskStateGroups();
    }
  }, [enterpriseId, hasAccessPermission]);

  const fetchTaskStateGroups = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await groupTaskStateApi.getAll(enterpriseId);
      const data = response.data || response;
      setTaskStateGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Không thể tải danh sách nhóm trạng thái công việc. " + (err?.response?.data?.message || err.message || ""));
      setTaskStateGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGroupDialog = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({ 
        name: group.name, 
        description: group.description || ""
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: "", description: "" });
    }
    setGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setGroupDialogOpen(false);
    setEditingGroup(null);
    setGroupForm({ name: "", description: "" });
    setError("");
  };

  const handleSaveGroup = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Validate form
      if (!groupForm.name || !groupForm.name.trim()) {
        setError("Vui lòng nhập tên nhóm trạng thái công việc");
        return;
      }
      
      const requestBody = {
        name: groupForm.name.trim(),
        description: groupForm.description?.trim() || ""
      };
      
      if (editingGroup) {
        await groupTaskStateApi.update(editingGroup.id, requestBody, enterpriseId);
      } else {
        await groupTaskStateApi.create(requestBody, enterpriseId);
      }
      
      handleCloseGroupDialog();
      await fetchTaskStateGroups();
    } catch (err) {
      let errorMessage = "Không thể lưu nhóm trạng thái công việc.";
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
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const group = taskStateGroups.find(g => g.id === groupId);
    setItemToDelete(group);
    setDeleteDialogOpen(true);
  };

  // ====== TASK STATES FUNCTIONS ======

  // Mở detail page của Task States
  const handleOpenTaskStatesDetail = (group) => {
    navigate(`/enterprise/${enterpriseId}/settings/group-task-states/${group.id}`);
  };

  return (
    <PermissionGate 
      hasPermission={hasAccessPermission}
      featureName="quản lý trạng thái công việc"
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenGroupDialog()}
          disabled={loading}
          size="large"
          sx={{ mt: 2, mr: 2, mb: 2 }}
        >
          Tạo nhóm mới
        </StyledButton>
        </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : taskStateGroups.length === 0 ? (
        <EmptyStateBox>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có nhóm trạng thái nào
          </Typography>
        </EmptyStateBox>
      ) : isMobile ? (
          // Mobile view: Cards
          <Grid container spacing={3}>
            {taskStateGroups.map((group) => (
              <Grid item xs={12} key={group.id}>
                <StyledCard onClick={() => handleOpenTaskStatesModal(group)}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {group.name}
                          </Typography>
                          <Chip 
                            label={`${group.states?.length || 0} trạng thái`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {group.description || "Không có mô tả"}
                        </Typography>
                      </Box>
                      <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenGroupDialog(group)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteGroup(group.id)} 
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.error.main, 0.1) 
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
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
                headerName: 'Tên nhóm',
                flex: 1,
                minWidth: 150,
                render: (value) => (
                  <Typography variant="body1" fontWeight={600}>
                    {value}
                  </Typography>
                ),
              },
              {
                field: 'description',
                headerName: 'Mô tả',
                flex: 1,
                minWidth: 200,
                render: (value) => (
                  <Typography variant="body2" color="text.secondary">
                    {value || "Không có mô tả"}
                  </Typography>
                ),
              },
              {
                field: 'states',
                headerName: 'Số trạng thái',
                width: 150,
                align: 'center',
                render: (value) => (
                  <Chip
                    label={value?.length || 0}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 60 }}
                  />
                ),
              },
              {
                field: 'actions',
                headerName: 'Hành động',
                width: 120,
                align: 'right',
                render: (_, row) => (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenGroupDialog(row);
                      }}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(row.id);
                      }}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ),
              },
            ]}
            data={taskStateGroups}
            loading={loading}
            page={0}
            pageSize={10}
            totalCount={taskStateGroups.length}
            onRowClick={(row) => handleOpenTaskStatesDetail(row)}
            emptyMessage="Không có nhóm trạng thái nào"
            minHeight={550} 
            maxHeight={550}
          />
        )}

      {/* Group Dialog */}
      <Dialog 
        open={groupDialogOpen} 
        onClose={handleCloseGroupDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            fontWeight: 700,
            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2,
          }}
        >
          {editingGroup ? "Chỉnh sửa nhóm trạng thái công việc" : "Tạo nhóm trạng thái mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, mt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Tên nhóm trạng thái"
              fullWidth
              required
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              disabled={submitting}
              placeholder="Nhập tên nhóm trạng thái"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={4}
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              disabled={submitting}
              placeholder="Nhập mô tả chi tiết về nhóm trạng thái này"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, gap: 1.5 }}>
          <Button 
            onClick={handleCloseGroupDialog} 
            disabled={submitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Hủy
          </Button>
          <StyledButton
            onClick={handleSaveGroup}
            variant="contained"
            disabled={submitting || !groupForm.name.trim()}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Đang lưu..." : (editingGroup ? "Cập nhật" : "Tạo mới")}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <CommonDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onSubmit={async () => {
          try {
            setIsDeleting(true);
            await groupTaskStateApi.delete(itemToDelete.id, enterpriseId);
            await fetchTaskStateGroups();
            setDeleteDialogOpen(false);
            setItemToDelete(null);
          } catch (err) {
            setError(err.response?.data?.message || "Không thể xóa. Vui lòng thử lại!");
          } finally {
            setIsDeleting(false);
          }
        }}
        loading={isDeleting}
        submitLabel="Xóa"
        cancelLabel="Hủy"
        submitColor="error"
        centerButtons={true}
        PaperProps={{
          sx: { maxWidth: '400px' }
        }}
      >
        <Typography sx={{ textAlign: 'center', mt: 2 }}>
          Bạn có chắc chắn muốn xóa <strong>{itemToDelete?.name}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
          Hành động này không thể hoàn tác.
        </Typography>
      </CommonDialog>

      </Box>
    </PermissionGate>
  );
}
