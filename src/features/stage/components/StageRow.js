import React, { useState, useEffect } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import StatusChip from "./StatusChip";
import { formatDateTime } from "../../../shared/utils/dateFormatter";
import taskApi from "../api/task.api";
import TaskKanbanBoard from "./TaskKanbanBoard";
import TaskDetailDialog from "./TaskDetailDialog";
import TaskDialog from "./TaskDialog"; // Import TaskDialog

const statusOptions = [
  { value: "IN_PROGRESS", label: "Đang thực hiện" },
  { value: "SUCCESS", label: "Hoàn thành" },
  { value: "CANCELED", label: "Đã hủy" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const StageRow = ({ stage, onEdit, onDelete, onChangeStatus, projectId, enterpriseId, taskStates, taskTypes }) => {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    if (!expanded) return; // Only fetch when expanding
    setLoadingTasks(true);
    setTaskError("");
    try {
      console.log("🔍 Fetching tasks for stage:", stage.id, "projectId:", projectId);
      
      // Call new API with required query params
      const response = await taskApi.getAll({
        projectId: projectId,
        stageId: stage.id,
        // Optional params can be added here if needed:
        // typeId: someTypeId,
        // stateId: someStateId,
        // keyword: searchKeyword,
        // page: 0,
        // size: 10,
      });
      
      console.log("📦 API Response:", response);
      console.log("📦 Response.data:", response.data);
      
      // Handle different response structures
      let taskList = [];
      if (Array.isArray(response.data)) {
        taskList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        taskList = response.data.data;
      } else if (response.data?.content && Array.isArray(response.data.content)) {
        taskList = response.data.content;
      }
      
      console.log("✅ Parsed task list:", taskList);
      setTasks(taskList);
    } catch (err) {
      setTaskError("Không thể tải danh sách công việc.");
      console.error("❌ Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchTasks();
    }
  }, [expanded]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(stage);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(stage);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    onChangeStatus(stage, newStatus);
  };

  const handleRowClick = (task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setDetailDialogOpen(false); // Close detail dialog first
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      console.log("💾 handleSaveTask - Starting save process:", {
        isEdit: !!editingTask,
        editingTaskId: editingTask?.id,
        stageId: stage.id,
        enterpriseId,
        taskData
      });

      if (editingTask) {
        // Update: taskId, data (phải có stageId), enterpriseId, userId
        const taskDataWithStage = {
          ...taskData,
          stageId: stage.id
        };
        console.log("🔧 UPDATE Mode - Payload details:", {
          taskId: editingTask.id,
          originalTask: editingTask,
          newData: taskDataWithStage,
          dataFields: {
            name: taskDataWithStage.name,
            description: taskDataWithStage.description,
            stateId: taskDataWithStage.stateId,
            typeId: taskDataWithStage.typeId,
            implementerIds: taskDataWithStage.implementerIds,
            testerIds: taskDataWithStage.testerIds,
            supporterIds: taskDataWithStage.supporterIds,
            images: taskDataWithStage.images,
            stageId: taskDataWithStage.stageId
          }
        });
        await taskApi.update(editingTask.id, taskDataWithStage, enterpriseId);
      } else {
        // Create: data phải chứa stageId, enterpriseId
        const taskDataWithStage = {
          ...taskData,
          stageId: stage.id
        };
        await taskApi.create(taskDataWithStage, enterpriseId);
      }
      console.log("✅ Save task successful");
      setTaskDialogOpen(false);
      setTaskError(""); // Clear any previous errors
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error("❌ Failed to save task:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error config:", error.config);
      
      // Re-throw the error so TaskDialog can handle it
      throw error;
    }
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Bạn có chắc muốn xóa công việc "${task.name}"?`)) {
      try {
        // Delete: taskId, enterpriseId, userId
        await taskApi.delete(task.id, enterpriseId);
        fetchTasks(); // Refresh task list
      } catch (error) {
        console.error("Failed to delete task", error);
        setTaskError("Không thể xóa công việc.");
      }
    }
  };

  const handleChangeTaskStatus = async (task, newStateId) => {
    try {
      // UpdateStatus: taskId, state
      await taskApi.updateStatus(task.id, newStateId);
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Failed to update task status", error);
      setTaskError("Không thể cập nhật trạng thái công việc.");
    }
  };

  return (
    <>
      <TableRow hover sx={{ bgcolor: "background.paper" }}>
        <TableCell sx={{ width: 50 }}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Thu gọn" : "Mở rộng"}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {stage.name}
          </Typography>
        </TableCell>
        <TableCell>
          <FormControl size="small" fullWidth >
            <Select
              value={stage.status || "IN_PROGRESS"}
              onChange={handleStatusChange}
              sx={{
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <StatusChip status={option.value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        <TableCell>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 300,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {stage.description || "Không có mô tả"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {formatDateTime(stage.startedAt)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {formatDateTime(stage.endedAt)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            title="Hành động"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Chỉnh sửa</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Xóa</ListItemText>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      {/* Expanded content - Task list */}
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, border: "none" }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, m: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" component="div">
                  Công việc
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddTask}
                >
                  Thêm công việc
                </Button>
              </Box>
              {loadingTasks ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : taskError ? (
                <Alert severity="error">{taskError}</Alert>
              ) : (
                <TaskKanbanBoard
                  tasks={tasks}
                  taskStates={taskStates}
                  onTaskClick={handleRowClick}
                  onTaskEdit={handleEditTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskStateChange={handleChangeTaskStatus}
                  loading={loadingTasks}
                  error={taskError}
                />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        task={selectedTask}
        onEdit={handleEditTask}
        projectId={projectId}
        stageId={stage.id}
        enterpriseId={enterpriseId}
      />

      {/* Task Add/Edit Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        stageId={stage.id}
        projectId={projectId}
        enterpriseId={enterpriseId}
        taskStates={taskStates}
        taskTypes={taskTypes}
      />
    </>
  );
};

export default StageRow;
