import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Paper,
  styled,
  alpha,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Inbox as InboxIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import stageApi from "../api/stage.api";
import projectApi from "../../project/api/project.api";
import groupTaskTypeApi from "../../type_setting/api/groupTaskTypeApi";
import StageTreeView from "../components/StageTreeView";
import StageDialog from "../components/StageDialog";
import TaskDetailDrawer from "../components/TaskDetailDrawer";
import TaskCreateDialog from "../components/TaskCreateDialog.jsx";
import { parseDateTimeLocal } from "../../../shared/utils/dateFormatter";
import taskApi from "../api/task.api";
import { TASK_STATES } from "../../../shared/constants/taskStates.js";

// Styled Components
const HeaderBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
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

const EmptyStateBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

/**
 * EventTask - Task/Stage management page
 * Displays list of stages with expand/collapse functionality
 * Future: Will show tasks under each stage
 */
export default function EventTask({ projectId: propProjectId, enterpriseId: propEnterpriseId, eventData }) {
  const { eventId, id: paramsEnterpriseId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use projectId and enterpriseId from props if provided, otherwise use params
  const projectId = propProjectId || eventId;
  const enterpriseId = propEnterpriseId || paramsEnterpriseId;

  // State
  const [stages, setStages] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog states
  const [editingTask, setEditingTask] = useState(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ stageId: null, taskTypeId: null, stageName: '' });
  const [submittingTask, setSubmittingTask] = useState(false);
  
  // Task detail drawer state
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch stages on mount - Tab "Công việc" không cần check quyền
  useEffect(() => {
    if (eventId) {
      fetchStages();
      fetchTaskTypes();
    }
  }, [eventId]);

  /**
   * Fetch all stages (without tasks initially)
   */
  const fetchStages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await stageApi.getAll(eventId, {
        page: 0,
        size: 10000,
      });
      
      const stageList = response.data?.data || response.data?.content || response.data || [];
      
      // Initialize stages without tasks - explicitly remove any tasks from backend
      const stagesData = stageList.map(stage => ({
        ...stage,
        tasks: null, // null = not loaded yet, explicitly override any tasks from backend
        tasksLoading: false,
      }));
      
      setStages(stagesData);
    } catch (err) {
      console.error("❌ Error fetching stages:", err);
      setError(err.message || "Không thể tải danh sách giai đoạn");
      showSnackbar("Không thể tải danh sách giai đoạn", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch tasks for a specific stage
   */
  const fetchTasksForStage = async (stageId) => {
    try {
      // Mark as loading
      setStages(prev => 
        prev.map(s => s.id === stageId ? { ...s, tasksLoading: true } : s)
      );

      const tasksResponse = await taskApi.getAll({
        projectId: eventId,
        stageId: stageId,
        page: 0,
        size: 1000,
      });
      
      const taskList = tasksResponse.data?.data || tasksResponse.data?.content || tasksResponse.data || [];
      
      console.log("📋 Fetched tasks for stage:", stageId);
      console.log("📋 Task list sample:", taskList.slice(0, 2)); // Log first 2 tasks to see structure
      
      // Update stage with tasks
      setStages(prev => 
        prev.map(s => s.id === stageId ? { ...s, tasks: taskList, tasksLoading: false } : s)
      );
    } catch (err) {
      console.error(`Error fetching tasks for stage ${stageId}:`, err);
      // Mark as error
      setStages(prev => 
        prev.map(s => s.id === stageId ? { ...s, tasks: [], tasksLoading: false, error: 'Không thể tải công việc' } : s)
      );
    }
  };

   /**
   * Fetch task types from project
   */
  
  const fetchTaskTypes = async () => {
    try {
      const response = await groupTaskTypeApi.filter(
        {
          projectId: eventId,
          keyword: "",
          pageable: {
            page: 0,
            size: 100,
            sort: []
          }
        },
        enterpriseId
      );

      const groups = response.data || [];

      // Flatten list of all types from all groups
      const allTypes = groups.flatMap(group => group.types || []);
      
      setTaskTypes(allTypes);
    } catch (err) {
    }
  };

  /**
   * Get current user ID from localStorage
   */
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || "";
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
    return "";
  };

  /**
   * Handle create/update stage
   */
  const handleSaveStage = async (stageForm, stageId) => {
    setSubmitting(true);
    try {
      const userId = getCurrentUserId();
      
      // Prepare payload
      const payload = {
        name: stageForm.name,
        description: stageForm.description,
        startedAt: parseDateTimeLocal(stageForm.startedAt),
        endedAt: parseDateTimeLocal(stageForm.endedAt),
        userIds: stageForm.userIds && stageForm.userIds.length > 0 
          ? stageForm.userIds 
          : (userId ? [userId] : []), // Use selected users or fallback to current user
      };

      // Add status only for update
      if (stageId) {
        payload.status = stageForm.status;
      }

      // Add location if provided
      if (stageForm.locationId) {
        payload.locationId = stageForm.locationId;
      }

      if (stageId) {
        // Update
        await stageApi.update(eventId, stageId, payload);
        showSnackbar("Cập nhật giai đoạn thành công", "success");
      } else {
        // Create
        await stageApi.create(eventId, payload);
        showSnackbar("Tạo giai đoạn thành công", "success");
      }

      setDialogOpen(false);
      setSelectedStage(null);
      fetchStages();
    } catch (err) {
      showSnackbar(
        err.message || "Không thể lưu giai đoạn",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete stage
   */
  const handleDeleteStage = async (stage) => {
    if (!window.confirm(`Bạn có chắc muốn xóa giai đoạn "${stage.name}"?`)) {
      return;
    }

    try {
      await stageApi.delete(eventId, stage.id);
      showSnackbar("Xóa giai đoạn thành công", "success");
      fetchStages();
    } catch (err) {
      // Check for specific error message from backend
      const errorMessage = err.response?.data?.message || "Không thể xóa giai đoạn";
      showSnackbar(errorMessage, "error");
    }
  };

  /**
   * Handle change stage status - call API to update stage status
   */
  const handleChangeStageStatus = async (stage, newStatus) => {
    if (stage.status === newStatus) {
      return;
    }

    const oldStatus = stage.status;

    try {
      // Update local state immediately for responsive UI
      setStages(prev =>
        prev.map(s =>
          s.id === stage.id
            ? { ...s, status: newStatus }
            : s
        )
      );

      // Call API to update stage status
      await stageApi.updateStatus(eventId, stage.id, newStatus);
      showSnackbar("Cập nhật trạng thái giai đoạn thành công", "success");
    } catch (err) {
      // Revert on error
      setStages(prev =>
        prev.map(s =>
          s.id === stage.id
            ? { ...s, status: oldStatus }
            : s
        )
      );
      const errorMessage = err.response?.data?.message || "Không thể cập nhật trạng thái giai đoạn";
      showSnackbar(errorMessage, "error");
    }
  };

  /**
   * Handle change task status - update task status only (separate from stage status)
   */
  const handleChangeTaskStatus = async (task, newStatus) => {
    console.log("🔄 handleChangeTaskStatus called with:", { task, newStatus, taskId: task?.id });
    
    if (!task || !task.id) {
      console.error("❌ Task or task.id is undefined:", task);
      showSnackbar("Lỗi: Không xác định được công việc", "error");
      return;
    }
    
    if (task.state === newStatus || task.status === newStatus) {
      return;
    }

    const oldStatus = task.state || task.status;
    console.log("🔄 Changing task status:", { taskId: task.id, from: oldStatus, to: newStatus });

    try {
      // Update task status only in local state immediately
      setStages(prev =>
        prev.map(stage =>
          stage.tasks
            ? {
                ...stage,
                // Only update task status, keep stage status unchanged
                tasks: stage.tasks.map(t =>
                  t.id === task.id 
                    ? { 
                        ...t, 
                        state: newStatus,
                        status: newStatus,
                      } 
                    : t
                ),
              }
            : stage
        )
      );

      // Call API in background to update task status only
      await taskApi.updateStatus(task.id, newStatus);
      console.log("✅ Task status updated successfully");
      showSnackbar("Cập nhật trạng thái công việc thành công", "success");
    } catch (err) {
      console.error("❌ Error updating task status:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      
      // Revert task status on error
      setStages(prev =>
        prev.map(stage =>
          stage.tasks
            ? {
                ...stage,
                tasks: stage.tasks.map(t =>
                  t.id === task.id 
                    ? { 
                        ...t, 
                        state: oldStatus,
                        status: oldStatus,
                      } 
                    : t
                ),
              }
            : stage
        )
      );
      
      const errorMessage = err.response?.data?.message || err.message || "Không thể cập nhật trạng thái công việc";
      showSnackbar(errorMessage, "error");
    }
  };

  /**
   * Open dialog for creating new stage
   */
  const handleAddStage = () => {
    setSelectedStage(null);
    setDialogOpen(true);
  };

  /**
   * Open dialog for editing stage
   */
  const handleEditStage = (stage) => {
    setSelectedStage(stage);
    setDialogOpen(true);
  };

  /**
   * Handle create task - add to local state without refetch
   */
  const handleCreateTask = async (stageId, taskData) => {
    setSubmittingTask(true);
    try {
      const taskResponse = await taskApi.create(taskData);
      const responseData = taskResponse.data || taskResponse.data?.data || {};

     
      
      // Merge response with original taskData to ensure all fields are present
      const newTask = {
        ...taskData,
        ...responseData,
        // Ensure startedAt/endedAt are preserved if missing from response
        startedAt: responseData.startedAt || taskData.startedAt || taskData.startAt,
        endedAt: responseData.endedAt || taskData.endedAt || taskData.endAt,
        // Ensure supplier data is preserved
        supplierId: responseData.supplierId || taskData.supplierId,
        supplier: responseData.supplier || (taskData.supplierId ? { id: taskData.supplierId } : null),
      };

      // Add new task to local state
      setStages(prev =>
        prev.map(stage =>
          stage.id === stageId && stage.tasks
            ? {
                ...stage,
                tasks: [...stage.tasks, newTask],
              }
            : stage
        )
      );

      showSnackbar("Tạo công việc thành công", "success");
      setCreateTaskDialogOpen(false);
      setNewTaskData({ stageId: null, taskTypeId: null, stageName: '' });
      return newTask;
    } catch (err) {
      console.error("❌ Error creating task:", err);
      showSnackbar(err.message || "Không thể tạo công việc", "error");
      throw err;
    } finally {
      setSubmittingTask(false);
    }
  };

  /**
   * Handle open edit task dialog
   */
  const handleEditTask = (task) => {
    if (!task) return;
    
    // Find stage of this task
    const stage = stages.find(s => s.tasks?.some(t => t.id === task.id));
    
    // Set task data for editing
    setNewTaskData({
      stageId: task.stageId || stage?.id,
      taskTypeId: task.typeId || task.taskType?.id,
      stageName: stage?.name || '',
    });
    setEditingTask(task);
    setCreateTaskDialogOpen(true);
    setTaskDetailOpen(false); // Close drawer when opening edit dialog
  };

  /**
   * Handle save edited task
   */
  const handleSaveEditTask = async (taskData) => {
    if (!editingTask) return;

    try {
  
      // Merge updated data with existing task to preserve all fields
      const updatedTask = {
        ...editingTask,
        ...taskData,
        // Ensure startedAt/endedAt are preserved
        startedAt: taskData.startedAt || taskData.startAt || editingTask.startedAt,
        endedAt: taskData.endedAt || taskData.endAt || editingTask.endedAt,
        // Ensure supplier data is preserved
        supplierId: taskData.supplierId !== undefined ? taskData.supplierId : editingTask.supplierId,
        supplier: taskData.supplierId ? { id: taskData.supplierId, ...(editingTask.supplier || {}) } : editingTask.supplier,
      };
      
      // Update local state immediately
      setStages(prev =>
        prev.map(stage =>
          stage.tasks
            ? {
                ...stage,
                tasks: stage.tasks.map(t =>
                  t.id === editingTask.id 
                    ? updatedTask
                    : t
                ),
              }
            : stage
        )
      );

      // Call API in background
      const updateResponse = await taskApi.update(editingTask.id, taskData);
      
      
      showSnackbar("Cập nhật công việc thành công", "success");
    } catch (err) {
      // Revert on error - refetch for this stage
      const taskStageId = stages.find(s => s.tasks?.some(t => t.id === editingTask.id))?.id;
      if (taskStageId) {
        fetchTasksForStage(taskStageId);
      }
      showSnackbar(err.message || "Không thể cập nhật công việc", "error");
      throw err;
    }
  };

  /**
   * Handle delete task - remove from local state only
   */
  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Bạn có chắc muốn xóa công việc "${task.name}"?`)) {
      return;
    }

    try {
      // Remove from local state immediately
      setStages(prev =>
        prev.map(stage =>
          stage.tasks
            ? {
                ...stage,
                tasks: stage.tasks.filter(t => t.id !== task.id),
              }
            : stage
        )
      );

      // Call API in background
      await taskApi.delete(task.id);
      showSnackbar("Xóa công việc thành công", "success");
    } catch (err) {
      // Revert on error
      fetchTasksForStage(task.stageId || stages.find(s => s.tasks?.some(t => t.id === task.id))?.id);
      console.error("❌ Error deleting task:", err);
      showSnackbar(err.message || "Không thể xóa công việc", "error");
    }
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{paddingTop: 'none'}}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStage}
          disabled={loading}
          sx={{margin: '10px 10px 0px 0px'}}
        >
          Thêm giai đoạn
        </StyledButton>
      </Box>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
          }} 
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Content - Luôn hiển thị, không cần alert quyền */}
      <>
        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress size={50} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              Đang tải giai đoạn...
            </Typography>
          </Box>
        ) : (
          /* Stage Tree View */
          <StageTreeView
            stages={stages}
            taskTypes={taskTypes}
            onEditStage={handleEditStage}
            onDeleteStage={handleDeleteStage}
            onChangeStageStatus={handleChangeStageStatus}
            onChangeTaskStatus={handleChangeTaskStatus}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setTaskDetailOpen(true);
            }}
            onToggleStage={fetchTasksForStage}
            onAddTask={(stageId, taskTypeId) => {
              // Open task create dialog with pre-filled stage and task type
              const stage = stages.find(s => s.id === stageId);
              setNewTaskData({
                stageId: stageId,
                taskTypeId: taskTypeId,
                stageName: stage?.name || '',
              });
              setCreateTaskDialogOpen(true);
            }}
            loading={loading}
          />
        )}

        {/* Stage Dialog */}
        <StageDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedStage(null);
          }}
          stage={selectedStage}
          onSave={handleSaveStage}
          submitting={submitting}
          isMobile={isMobile}
          projectId={projectId}
          enterpriseId={enterpriseId}
        />

        {/* Task Create/Edit Dialog */}
        <TaskCreateDialog
          open={createTaskDialogOpen}
          onClose={() => {
            setCreateTaskDialogOpen(false);
            setNewTaskData({ stageId: null, taskTypeId: null, stageName: '' });
            setEditingTask(null);
          }}
          stageId={newTaskData.stageId}
          stageName={newTaskData.stageName}
          taskTypeId={newTaskData.taskTypeId}
          taskTypes={taskTypes}
          onCreate={handleCreateTask}
          onEdit={handleSaveEditTask}
          task={editingTask}
          submitting={submittingTask}
          projectId={projectId}
        />

        {/* Task Detail Drawer */}
        <TaskDetailDrawer
          open={taskDetailOpen}
          onClose={() => {
            setTaskDetailOpen(false);
            setSelectedTask(null);
          }}
          stageName={stages.find(s => s.tasks?.some(t => t.id === selectedTask?.id))?.name || ""}
          task={selectedTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onChangeStatus={handleChangeTaskStatus}
          users={[]}
          taskTypes={taskTypes}
          taskStates={TASK_STATES}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    </Box>
  );
}
