import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSidebar } from "../../../shared/contexts/SidebarContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Grid,
  styled,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import axiosClient from "../../../app/axios/axiosClient";
import PermissionGate from "../../../shared/components/PermissionGate";
import CommonDialog from "../../../shared/components/CommonDialog";
import TaskTypeDialogHookForm from "../components/TaskTypeDialogHookForm";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";

const StyledButton = styled(Box)(({ theme }) => ({
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

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

// Color palette presets
const COLOR_PRESETS = [
  '#9E9E9E', '#3F51B5', '#42A5F5', '#81C784',
  '#FFB300', '#E53935', '#D84315', '#43A047'
];

export default function GroupTaskTypeDetail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: enterpriseId, groupId } = useParams();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();

  const [group, setGroup] = useState(null);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Task Type Dialog
  const [taskTypeDialogOpen, setTaskTypeDialogOpen] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState(null);

  // React Hook Form
  const { register, watch, reset, handleSubmit, setValue, formState: { isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
      taskTypeName: "",
      taskTypeDescription: "",
      taskTypeColor: COLOR_PRESETS[0],
    }
  });

  const taskTypeName = watch('taskTypeName');
  const taskTypeDescription = watch('taskTypeDescription');
  const taskTypeColor = watch('taskTypeColor');

  // Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskTypeToDelete, setTaskTypeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sidebar width
  const sidebarWidth = sidebarCollapsed ? 64 : 260;
  const contentPadding = 24;

  // Fetch group và task types
  useEffect(() => {
    fetchGroupAndTypes();
  }, [enterpriseId, groupId]);

  // Handle task type dialog state changes
  useEffect(() => {
    if (taskTypeDialogOpen) {
      if (editingTaskType) {
        reset({
          taskTypeName: editingTaskType.name,
          taskTypeDescription: editingTaskType.description || "",
          taskTypeColor: editingTaskType.color || COLOR_PRESETS[0],
        });
      } else {
        reset({
          taskTypeName: "",
          taskTypeDescription: "",
          taskTypeColor: COLOR_PRESETS[0],
        });
      }
    }
  }, [taskTypeDialogOpen, editingTaskType, reset]);

  const fetchGroupAndTypes = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch group từ danh sách
      const response = await axiosClient.get(`/group-task-type`, {
        headers: {
          "enterprise-id": enterpriseId
        }
      });
      const allGroups = response.data || response;
      const foundGroup = Array.isArray(allGroups) ? allGroups.find(g => g.id === parseInt(groupId)) : null;
      
      if (!foundGroup) {
        setError("Không tìm thấy nhóm loại công việc");
        setGroup(null);
      } else {
        setGroup(foundGroup);
        await fetchTaskTypes(groupId);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. " + (err?.message || ""));
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTypes = async (currentGroupId) => {
    try {
      const response = await axiosClient.get(`/group-task-type/${currentGroupId}/task-type`, {
        headers: {
          "enterprise-id": enterpriseId
        }
      });
      const data = response.data || response;
      setTaskTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setTaskTypes([]);
    }
  };

  const handleOpenTaskTypeDialog = useCallback((taskType = null) => {
    setEditingTaskType(taskType);
    setTaskTypeDialogOpen(true);
  }, []);

  const handleCloseTaskTypeDialog = useCallback(() => {
    setTaskTypeDialogOpen(false);
    setEditingTaskType(null);
  }, []);

  const handleSaveTaskType = async (data) => {
    if (!data.taskTypeName.trim()) {
      alert("Vui lòng nhập tên loại công việc");
      return;
    }

    try {
      setSubmitting(true);
      const requestBody = {
        name: data.taskTypeName.trim(),
        description: data.taskTypeDescription.trim(),
        color: data.taskTypeColor,
      };

      if (editingTaskType) {
        await axiosClient.put(
          `/group-task-type/${groupId}/task-type/${editingTaskType.id}`,
          requestBody,
          {
            headers: {
              "enterprise-id": enterpriseId
            }
          }
        );
      } else {
        await axiosClient.post(
          `/group-task-type/${groupId}/task-type`,
          requestBody,
          {
            headers: {
              "enterprise-id": enterpriseId
            }
          }
        );
      }

      handleCloseTaskTypeDialog();
      await fetchTaskTypes(groupId);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể lưu loại công việc");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTaskType = (taskType) => {
    setTaskTypeToDelete(taskType);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskTypeToDelete) return;

    try {
      setIsDeleting(true);
      await axiosClient.delete(
        `/group-task-type/${groupId}/task-type/${taskTypeToDelete.id}`,
        {
          headers: {
            "enterprise-id": enterpriseId
          }
        }
      );
      setDeleteDialogOpen(false);
      setTaskTypeToDelete(null);
      await fetchTaskTypes(groupId);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa loại công việc");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTaskTypeToDelete(null);
    setIsDeleting(false);
  };

  const handleBack = () => {
    navigate(`/enterprise/${enterpriseId}/settings/group-task-types`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !group) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="error">
          {error || "Không tìm thấy nhóm loại công việc."}
        </Typography>
      </Box>
    );
  }

  return (
    <PermissionGate 
      hasPermission={true}
      featureName="quản lý loại công việc"
    >
      <Box sx={{ minHeight: 'calc(100vh - 64px*2)', backgroundColor: "#f5f5f5" }}>
        {/* Box nằm trên AppBar */}
        <Box
          sx={{
            position: "fixed",
            top: '64px',
            left: { xs: 0, md: `calc(${sidebarWidth}px + ${contentPadding}px)` },
            right: { xs: 0, md: 'auto' },
            width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - ${contentPadding * 2}px)` },
            height: { xs: 0, md: '25px' },
            backgroundColor: "#f8fafc",
            zIndex: (theme) => theme.zIndex.drawer + 3,
            transition: 'width 0.3s ease, left 0.3s ease, right 0.3s ease',
          }}
        />

        {/* AppBar cố định */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            top: { xs: 0, md: 'calc(25px + 64px)' },
            left: { xs: 0, md: `calc(${sidebarWidth}px + ${contentPadding}px)` },
            right: { xs: 0, md: 'auto' },
            width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - ${contentPadding * 2}px)` },
            backgroundColor: "#fff",
            color: "#333",
            borderBottom: '1px solid #e0e0e0',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            transition: 'width 0.3s ease, left 0.3s ease, right 0.3s ease',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: 0 }}>
              <IconButton 
                edge="start" 
                color="inherit" 
                onClick={handleBack} 
                sx={{ 
                  mr: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {group?.name}
                </Typography>
              </Box>
              <StyledButton
                onClick={() => handleOpenTaskTypeDialog()}
                disabled={loading}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AddIcon fontSize="small" />
                Thêm mới
              </StyledButton>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Content Area */}
        <Box 
          sx={{ 
            pt: { xs: '112px', md: '98px' },
            px: 0,
            pb: 1,
          }}
        >
          <Card 
            sx={{ 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              backgroundColor: '#fff',
              minHeight: 'calc(100vh - 240px)',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {taskTypes.length === 0 ? (
                <EmptyStateBox sx={{ m: 3 }}>
                  <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Chưa có loại công việc nào
                  </Typography>
                </EmptyStateBox>
              ) : (
                <Grid container spacing={2} sx={{ p: 2 }}>
                  {taskTypes.map((taskType, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={taskType.id}>
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
                              onClick={() => handleDeleteTaskType(taskType)}
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
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Task Type Dialog */}
        <TaskTypeDialogHookForm
          open={taskTypeDialogOpen}
          onClose={handleCloseTaskTypeDialog}
          onSubmit={handleSubmit(handleSaveTaskType)}
          editingTaskType={editingTaskType}
          submitting={submitting}
          register={register}
          watch={watch}
          setValue={setValue}
          taskTypeName={taskTypeName}
          taskTypeColor={taskTypeColor}
        />

        {/* Delete Confirmation Dialog */}
        <CommonDialog
          open={deleteDialogOpen}
          title="Xác nhận xóa"
          onClose={handleCloseDeleteDialog}
          onSubmit={handleConfirmDelete}
          loading={isDeleting}
          submitLabel="Xóa"
          cancelLabel="Hủy"
          centerButtons={true}
          submitColor="error"
          PaperProps={{
            sx: { maxWidth: '400px' }
          }}
        >
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            Bạn có chắc chắn muốn xóa loại công việc <strong>{taskTypeToDelete?.name}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </CommonDialog>
      </Box>
    </PermissionGate>
  );
}
