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
  Category as CategoryIcon,
} from "@mui/icons-material";
import axiosClient from "../../../app/axios/axiosClient";
import PermissionGate from "../../../shared/components/PermissionGate";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";
import { CommonTable } from "../../../shared/components/CommonTable";
import CommonDialog from "../../../shared/components/CommonDialog";
import {
  StyledTableContainer,
  StyledButton,
  StyledCard,
  SectionHeader,
  EmptyStateBox,
} from "../../../shared/layouts/sharedStyles";

/**
 * TaskCategoryManagement - Quản lý nhóm phân loại công việc (Group Task Type)
 * API: GET /group-task-type - Lấy danh sách nhóm
 * API: POST /group-task-type - Tạo nhóm mới
 * 
 * Props:
 * - enterpriseId: ID của doanh nghiệp
 * - userPermissions: Danh sách quyền của user
 * - hasPermission: Function kiểm tra xem user có quyền cụ thể
 * - requiredPermission: Mã quyền cần để truy cập tab này
 */
export default function TaskCategoryManagement({ 
  enterpriseId,
  userPermissions = [],
  hasPermission = () => true,
  requiredPermission = PERMISSION_CODES.TASK_TYPE_MANAGE
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Kiểm tra quyền của user
  const hasAccessPermission = hasPermission(requiredPermission);
  
  const [taskCategories, setTaskCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ 
    name: "", 
    description: ""
  });

  // Delete Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'category' hoặc 'taskType'
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task Types Management States
  const [taskTypesModalOpen, setTaskTypesModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [taskTypes, setTaskTypes] = useState([]);
  const [taskTypesLoading, setTaskTypesLoading] = useState(false);
  const [taskTypeDialogOpen, setTaskTypeDialogOpen] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState(null);
  const [taskTypeForm, setTaskTypeForm] = useState({
    name: "",
    description: "",
    color: "#4287f5"
  });

  // Fetch danh sách nhóm phân loại công việc
  useEffect(() => {
    // Chỉ fetch nếu user có quyền
    if (hasAccessPermission) {
      fetchTaskCategories();
    }
  }, [enterpriseId, hasAccessPermission]);

  const fetchTaskCategories = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axiosClient.get("/group-task-type", {
        headers: {
          "enterprise-id": enterpriseId
        }
      });
      
      // Extract data array từ response
      const data = response?.data || response || [];
      setTaskCategories(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError("Không thể tải danh sách nhóm phân loại công việc. " + (err?.response?.data?.message || err.message || ""));
      setTaskCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ 
        name: category.name, 
        description: category.description || ""
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setError("");
  };

  const handleSaveCategory = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Validate form
      if (!categoryForm.name || !categoryForm.name.trim()) {
        setError("Vui lòng nhập tên nhóm phân loại công việc");
        return;
      }
      
      if (editingCategory) {
        // Update existing group task type
        const requestBody = {
        
          name: categoryForm.name.trim(),
          description: categoryForm.description?.trim() || "",
          
        };
        
        const responseData = await axiosClient.put(
          `/group-task-type/${editingCategory.id}`, 
          requestBody,
          {
            headers: {
              "enterprise-id": enterpriseId,
              "Content-Type": "application/json"
            }
          }
        );
        
      
        
        // Reload danh sách
        await fetchTaskCategories();
      } else {
        // Tạo nhóm mới
        
        const response = await axiosClient.post("/group-task-type", {
          name: categoryForm.name,
          description: categoryForm.description || ""
        }, {
          headers: {
            "enterprise-id": enterpriseId
          }
        });
        
        
        // Reload danh sách
        await fetchTaskCategories();
      }
      
      handleCloseDialog();
    } catch (err) {

      let errorMessage = "Không thể lưu nhóm phân loại công việc.";
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

  const handleDeleteCategory = async (categoryId) => {
    const category = taskCategories.find(c => c.id === categoryId);
    setItemToDelete(category);
    setDeleteTarget('category');
    setDeleteDialogOpen(true);
  };

  // ====== TASK TYPES FUNCTIONS ======

  // Mở detail page của Task Types
  const handleOpenTaskTypesDetail = (group) => {
    navigate(`/enterprise/${enterpriseId}/settings/group-task-types/${group.id}`);
  };

  // Mở modal Task Types
  const handleOpenTaskTypesModal = async (group) => {
    setSelectedGroup(group);
    setTaskTypesModalOpen(true);
    await fetchTaskTypes(group.id);
  };

  // Đóng modal Task Types
  const handleCloseTaskTypesModal = () => {
    setTaskTypesModalOpen(false);
    setSelectedGroup(null);
    setTaskTypes([]);
  };

  // Fetch Task Types của một nhóm
  const fetchTaskTypes = async (groupId) => {
    try {
      setTaskTypesLoading(true);
      
      const response = await axiosClient.get(`/group-task-type/${groupId}/task-type`, {
        headers: {
          "enterprise-id": enterpriseId
        }
      });
      
      setTaskTypes(response.data || response || []);
    } catch (err) {
      setTaskTypes([]);
    } finally {
      setTaskTypesLoading(false);
    }
  };

  // Mở dialog thêm/sửa Task Type
  const handleOpenTaskTypeDialog = (taskType = null) => {
    if (taskType) {
      setEditingTaskType(taskType);
      setTaskTypeForm({
        name: taskType.name,
        description: taskType.description || "",
        color: taskType.color || "#4287f5"
      });
    } else {
      setEditingTaskType(null);
      setTaskTypeForm({
        name: "",
        description: "",
        color: "#4287f5"
      });
    }
    setTaskTypeDialogOpen(true);
  };

  // Đóng dialog Task Type
  const handleCloseTaskTypeDialog = () => {
    setTaskTypeDialogOpen(false);
    setEditingTaskType(null);
    setTaskTypeForm({
      name: "",
      description: "",
      color: "#4287f5"
    });
  };

  // Lưu Task Type (Create/Update)
  const handleSaveTaskType = async () => {
    if (!taskTypeForm.name.trim()) {
      alert("Vui lòng nhập tên loại công việc");
      return;
    }

    try {
      setSubmitting(true);
      
      const requestBody = {
        name: taskTypeForm.name.trim(),
        description: taskTypeForm.description.trim(),
        color: taskTypeForm.color
      };

      if (editingTaskType) {
        await axiosClient.put(
          `/group-task-type/${selectedGroup.id}/task-type/${editingTaskType.id}`,
          requestBody,
          {
            headers: {
              "enterprise-id": enterpriseId
            }
          }
        );
      } else {
        await axiosClient.post(
          `/group-task-type/${selectedGroup.id}/task-type`,
          requestBody,
          {
            headers: {
              "enterprise-id": enterpriseId
            }
          }
        );
      }

      handleCloseTaskTypeDialog();
      await fetchTaskTypes(selectedGroup.id);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể lưu loại công việc");
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa Task Type
  const handleDeleteTaskType = async (taskTypeId) => {
    const taskType = taskTypes.find(t => t.id === taskTypeId);
    setItemToDelete(taskType);
    setDeleteTarget('taskType');
    setDeleteDialogOpen(true);
  };

  return (
    <PermissionGate 
      hasPermission={hasAccessPermission}
      featureName="quản lý loại công việc"
    >
      <Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
          size="large"
          sx={{m: '20px'}}
        >
          Tạo nhóm mới
        </StyledButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : taskCategories.length === 0 ? (
        <EmptyStateBox>
          <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có nhóm phân loại nào
          </Typography>
        </EmptyStateBox>
      ) : isMobile ? (
          // Mobile view: Cards
          <Grid container spacing={3}>
            {taskCategories.map((category) => (
              <Grid item xs={12} key={category.id}>
                <StyledCard onClick={() => handleOpenTaskTypesDetail(category)}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {category.name}
                          </Typography>
                          <Chip 
                            label={`${category.types?.length || 0} loại`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                          {category.isActive && (
                            <Chip label="Active" size="small" color="success" variant="outlined" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {category.description || "Không có mô tả"}
                        </Typography>
                      </Box>
                      <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(category)}
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
                          onClick={() => handleDeleteCategory(category.id)}
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
                field: 'types',
                headerName: 'Số phân loại con',
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
                        handleOpenDialog(row);
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
                        handleDeleteCategory(row.id);
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
            data={taskCategories}
            loading={loading}
            page={0}
            pageSize={10}
            totalCount={taskCategories.length}
            onRowClick={(row) => handleOpenTaskTypesDetail(row)}
            emptyMessage="Không có nhóm phân loại nào"
            minHeight={550} 
            maxHeight={550}
          />
        )}

      {/* Category Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            [theme.breakpoints.down('sm')]: {
              borderRadius: 0,
              margin: 0,
              maxHeight: '100vh',
            },
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
          {editingCategory ? "Chỉnh sửa nhóm phân loại công việc" : "Tạo nhóm phân loại mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Tên nhóm phân loại"
              fullWidth
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              disabled={submitting}
              placeholder="Nhập tên nhóm phân loại"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Mô tả chi tiết"
              fullWidth
              multiline
              rows={4}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              disabled={submitting}
              placeholder="Nhập mô tả chi tiết về nhóm phân loại này"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            gap: 2,
          }}
        >
          <Button 
            onClick={handleCloseDialog} 
            disabled={submitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <StyledButton
            onClick={handleSaveCategory} 
            variant="contained"
            color="primary"
            disabled={submitting || !categoryForm.name.trim()}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Đang lưu..." : (editingCategory ? "Cập nhật" : "Tạo mới")}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Task Types Modal */}
      <Dialog
        open={taskTypesModalOpen}
        onClose={handleCloseTaskTypesModal}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            [theme.breakpoints.down('sm')]: {
              borderRadius: 0,
              margin: 0,
              maxHeight: '100vh',
            },
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Các loại công việc trong nhóm: {selectedGroup?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {selectedGroup?.description || "Không có mô tả"}
              </Typography>
            </Box>
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTaskTypeDialog()}
              disabled={taskTypesLoading}
              size="small"
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Thêm loại công việc
            </StyledButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {taskTypesLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : taskTypes.length === 0 ? (
            <EmptyStateBox>
              <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Chưa có loại công việc nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Hãy thêm loại công việc đầu tiên cho nhóm này!
              </Typography>
              <StyledButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTaskTypeDialog()}
              >
                Thêm loại công việc
              </StyledButton>
            </EmptyStateBox>
          ) : (
            <Grid container spacing={2}>
              {taskTypes.map((taskType) => (
                <Grid item xs={12} sm={6} md={4} key={taskType.id}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      backgroundColor: '#fff',
                      position: 'relative'
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        bgcolor: taskType.color,
                        color: '#fff',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {taskType.name}
                      </Typography>

                      {/* Edit and Delete Icons */}
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenTaskTypeDialog(taskType)}
                          sx={{ 
                            p: 0.5,
                            color: '#fff',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteTaskType(taskType.id)}
                          sx={{ 
                            p: 0.5,
                            color: '#ff4444',
                            '&:hover': { 
                              backgroundColor: 'rgba(255, 68, 68, 0.2)' 
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {taskType.description || "Không có mô tả"}
                      </Typography>

                      {/* Trạng thái có thể chuyển đến */}
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        Tình trạng có thể chuyển đến
                      </Typography>

                      {taskType.transitions?.length > 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          {taskType.transitions
                            .map((transition) => {
                              const fromTaskType = taskTypes.find(t => t.id === transition.fromTaskTypeId);
                              return fromTaskType?.name || '';
                            })
                            .filter(name => name)
                            .join(', ')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Tất cả
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <StyledButton onClick={handleCloseTaskTypesModal} variant="outlined" color="primary">
            Đóng
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Task Type Create/Edit Dialog */}
      <Dialog
        open={taskTypeDialogOpen}
        onClose={handleCloseTaskTypeDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            [theme.breakpoints.down('sm')]: {
              borderRadius: 0,
              margin: 0,
              maxHeight: '100vh',
            },
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
          {editingTaskType ? "Chỉnh sửa loại công việc" : "Thêm loại công việc mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Tên loại công việc"
              fullWidth
              required
              value={taskTypeForm.name}
              onChange={(e) => setTaskTypeForm({ ...taskTypeForm, name: e.target.value })}
              disabled={submitting}
              placeholder="Ví dụ: Thiết kế poster"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={taskTypeForm.description}
              onChange={(e) => setTaskTypeForm({ ...taskTypeForm, description: e.target.value })}
              disabled={submitting}
              placeholder="Mô tả chi tiết về loại công việc này"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Box>
              <Typography variant="body2" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                Màu sắc *
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box
                  component="input"
                  type="color"
                  value={taskTypeForm.color}
                  onChange={(e) => setTaskTypeForm({ ...taskTypeForm, color: e.target.value })}
                  disabled={submitting}
                  sx={{
                    width: 70,
                    height: 50,
                    border: `2px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.secondary.main,
                      transform: 'scale(1.05)',
                    },
                    '&:disabled': {
                      cursor: 'not-allowed',
                      opacity: 0.6,
                    }
                  }}
                />
                <TextField
                  value={taskTypeForm.color}
                  onChange={(e) => setTaskTypeForm({ ...taskTypeForm, color: e.target.value })}
                  disabled={submitting}
                  size="small"
                  placeholder="#4287f5"
                  sx={{ 
                    flex: 1,
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: taskTypeForm.color,
                    border: `2px solid ${alpha(theme.palette.divider, 0.3)}`,
                    boxShadow: `0 2px 8px ${alpha(taskTypeForm.color, 0.4)}`,
                    flexShrink: 0,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            gap: 2,
          }}
        >
          <Button 
            onClick={handleCloseTaskTypeDialog} 
            disabled={submitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <StyledButton
            onClick={handleSaveTaskType}
            variant="contained"
            color="primary"
            disabled={submitting || !taskTypeForm.name.trim()}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Đang lưu..." : (editingTaskType ? "Cập nhật" : "Tạo mới")}
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
          setDeleteTarget(null);
        }}
        onSubmit={async () => {
          try {
            setIsDeleting(true);
            if (deleteTarget === 'category') {
              await axiosClient.delete(`/group-task-type/${itemToDelete.id}`, {
                headers: { 
                  "enterprise-id": enterpriseId 
                }
              });
              await fetchTaskCategories();
            } else if (deleteTarget === 'taskType') {
              await axiosClient.delete(
                `/group-task-type/${selectedGroup.id}/task-type/${itemToDelete.id}`,
                {
                  headers: {
                    "enterprise-id": enterpriseId
                  }
                }
              );
              await fetchTaskTypes(selectedGroup.id);
            }
            setDeleteDialogOpen(false);
            setItemToDelete(null);
            setDeleteTarget(null);
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
