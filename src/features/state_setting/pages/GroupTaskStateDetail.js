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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  styled,
  alpha,
  Grid,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import groupTaskStateApi from "../api/groupTaskStateApi";
import PermissionGate from "../../../shared/components/PermissionGate";
import CommonDialog from "../../../shared/components/CommonDialog";
import TaskStateDialogHookForm from "../components/TaskStateDialogHookForm";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";


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

export default function GroupTaskStateDetail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: enterpriseId, groupId } = useParams();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();

  const [group, setGroup] = useState(null);
  const [taskStates, setTaskStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Task State Dialog
  const [taskStateDialogOpen, setTaskStateDialogOpen] = useState(false);
  const [editingTaskState, setEditingTaskState] = useState(null);

  // React Hook Form
  const { register, watch, reset, handleSubmit, setValue, formState: { isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
      taskStateName: "",
      taskStateDescription: "",
      taskStateColor: COLOR_PRESETS[0],
      previousStateIds: [],
    }
  });

  const taskStateName = watch('taskStateName');
  const taskStateDescription = watch('taskStateDescription');
  const taskStateColor = watch('taskStateColor');
  const previousStateIds = watch('previousStateIds');

  // Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskStateToDelete, setTaskStateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sidebar width
  const sidebarWidth = sidebarCollapsed ? 64 : 260;
  const contentPadding = 24;

  // Fetch group và task states
  useEffect(() => {
    fetchGroupAndStates();
  }, [enterpriseId, groupId]);

  // Handle task state dialog state changes
  useEffect(() => {
    if (taskStateDialogOpen) {
      if (editingTaskState) {
        // Get previousStateIds from transitions: map fromStateId
        const previousStateIds = editingTaskState.transitions?.map(t => t.fromStateId) || [];
        reset({
          taskStateName: editingTaskState.name,
          taskStateDescription: editingTaskState.description || "",
          taskStateColor: editingTaskState.color || COLOR_PRESETS[0],
          previousStateIds: previousStateIds,
        });
      } else {
        reset({
          taskStateName: "",
          taskStateDescription: "",
          taskStateColor: COLOR_PRESETS[0],
          previousStateIds: [],
        });
      }
    }
  }, [taskStateDialogOpen, editingTaskState, reset]);

  const fetchGroupAndStates = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch group từ danh sách
      const response = await groupTaskStateApi.getAll(enterpriseId);
      const allGroups = response.data || response;
      const foundGroup = Array.isArray(allGroups) ? allGroups.find(g => g.id === parseInt(groupId)) : null;
      
      if (!foundGroup) {
        setError("Không tìm thấy nhóm trạng thái công việc");
        setGroup(null);
      } else {
        setGroup(foundGroup);
        await fetchTaskStates(groupId);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. " + (err?.message || ""));
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStates = async (currentGroupId) => {
    try {
      const response = await groupTaskStateApi.getTaskStates(currentGroupId, enterpriseId);
      const data = response.data || response;
      setTaskStates(Array.isArray(data) ? data : []);
    } catch (err) {
      setTaskStates([]);
    }
  };

  const handleOpenTaskStateDialog = useCallback((taskState = null) => {
    setEditingTaskState(taskState);
    setTaskStateDialogOpen(true);
  }, []);

  const handleCloseTaskStateDialog = useCallback(() => {
    setTaskStateDialogOpen(false);
    setEditingTaskState(null);
  }, []);

  const handleSaveTaskState = async (data) => {
    if (!data.taskStateName.trim()) {
      alert("Vui lòng nhập tên trạng thái công việc");
      return;
    }

    try {
      setSubmitting(true);
      const requestBody = {
        name: data.taskStateName.trim(),
        description: data.taskStateDescription.trim(),
        color: data.taskStateColor,
        previousStateIds: data.previousStateIds || []
      };

      if (editingTaskState) {
        await groupTaskStateApi.updateTaskState(groupId, editingTaskState.id, requestBody, enterpriseId);
      } else {
        await groupTaskStateApi.createTaskState(groupId, requestBody, enterpriseId);
      }

      handleCloseTaskStateDialog();
      await fetchTaskStates(groupId);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể lưu trạng thái công việc");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTaskState = (taskState) => {
    setTaskStateToDelete(taskState);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskStateToDelete) return;

    try {
      setIsDeleting(true);
      await groupTaskStateApi.deleteTaskState(groupId, taskStateToDelete.id, enterpriseId);
      setDeleteDialogOpen(false);
      setTaskStateToDelete(null);
      await fetchTaskStates(groupId);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa trạng thái công việc");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTaskStateToDelete(null);
    setIsDeleting(false);
  };

  const handleBack = () => {
    navigate(`/enterprise/${enterpriseId}/settings/group-task-states`);
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
          {error || "Không tìm thấy nhóm trạng thái công việc."}
        </Typography>
      </Box>
    );
  }

  return (
    <PermissionGate 
      hasPermission={true}
      featureName="quản lý trạng thái công việc"
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
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTaskStateDialog()}
                disabled={loading}
                size="medium"
              >
                Thêm trạng thái
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
  {taskStates.length === 0 ? (
    <EmptyStateBox sx={{ m: 3 }}>
      <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
        Chưa có trạng thái nào
      </Typography>
    </EmptyStateBox>
  ) : (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {taskStates.map((taskState, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={taskState.id}>
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
                bgcolor: taskState.color,
                color: '#fff',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {taskState.name}
              </Typography>

              {/* Edit and Delete Icons */}
              <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenTaskStateDialog(taskState)}
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
                  onClick={() => handleDeleteTaskState(taskState)}
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
              {/* Trạng thái có thể chuyển đến */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Trạng thái có thể chuyển đến
              </Typography>

              {taskState.transitions?.length > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {taskState.transitions
                    .map((transition) => {
                      const fromState = taskStates.find(s => s.id === transition.fromStateId);
                      return fromState?.name || '';
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
</CardContent>

          </Card>
        </Box>

        {/* Task State Dialog */}
        <TaskStateDialogHookForm
          open={taskStateDialogOpen}
          onClose={handleCloseTaskStateDialog}
          onSubmit={handleSubmit(handleSaveTaskState)}
          editingTaskState={editingTaskState}
          submitting={submitting}
          register={register}
          watch={watch}
          setValue={setValue}
          taskStateName={taskStateName}
          taskStateColor={taskStateColor}
          previousStateIds={previousStateIds}
          availableStates={taskStates}
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
            Bạn có chắc chắn muốn xóa trạng thái công việc <strong>{taskStateToDelete?.name}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </CommonDialog>
      </Box>
    </PermissionGate>
  );
}
