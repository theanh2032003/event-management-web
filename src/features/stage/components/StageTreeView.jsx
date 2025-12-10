import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  styled,
  alpha,
  Card,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const StageContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
}));

const StageHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
}));

const TreeLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(0.5),
  padding: `${theme.spacing(1)} 0`,
  paddingLeft: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 4,
    top: theme.spacing(2.5),
    width: 1,
    height: `calc(100% - ${theme.spacing(2.5)})`,
    backgroundColor: alpha(theme.palette.divider, 0.3),
  },
}));

const TypeContainer = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  borderLeft: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
  marginLeft: theme.spacing(2),
}));

const TaskItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const TaskStatus = styled(Select)(({ theme }) => ({
  minWidth: 120,
  height: 32,
  '& .MuiOutlinedInput-input': {
    padding: '6px 12px',
  },
}));

const statusOptions = [
  { value: 'PENDING', label: 'Chưa bắt đầu', color: '#FFA500' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#1976D2' },
  { value: 'SUCCESS', label: 'Hoàn thành', color: '#388E3C' },
  { value: 'CANCEL', label: 'Hủy bỏ', color: '#D32F2F' },
];

const stateTaskOptions = [
  { value: 'PENDING', label: 'Chưa bắt đầu', color: '#FFA500' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#1976D2' },
  { value: 'DONE', label: 'Hoàn thành', color: '#388E3C' },
  { value: 'CANCELLED', label: 'Hủy bỏ', color: '#D32F2F' },
];

const getStatusColor = (status) => {
  const found = statusOptions.find(s => s.value === status);
  return found?.color || '#757575';
};

const getStatusLabel = (status) => {
  const found = statusOptions.find(s => s.value === status);
  return found?.label || status;
};

/**
 * StageTreeView - Hiển thị các giai đoạn dạng cây
 */
export default function StageTreeView({
  stages = [],
  onEditStage,
  onDeleteStage,
  onChangeStatus,
  onSelectTask,
  onToggleStage, // New callback when stage is toggled
  loading = false,
}) {
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({}); // Track expanded task types

  const toggleStage = (stage) => {
    const stageId = stage.id;
    const isExpanding = !expandedStages[stageId];
    
    // Update expanded state
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));

    // If expanding, always fetch tasks (don't cache)
    if (isExpanding) {
      onToggleStage?.(stageId);
    }
  };

  const toggleTaskType = (stageId, typeId) => {
    const typeKey = `${stageId}-${typeId}`;
    const isExpanding = !expandedTypes[typeKey];
    
    setExpandedTypes((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
    
    // Gọi lại API chỉ khi mở loại công việc, không gọi khi đóng
    if (isExpanding) {
      onToggleStage?.(stageId);
    }
  };

  // Group tasks by type
  const groupTasksByType = (tasks = []) => {
    const grouped = {};
    tasks.forEach((task) => {
      const typeId = task.taskTypeId || 'unknown';
      const typeName = task.taskType?.name || task.taskTypeName || 'Loại chưa xác định';
      if (!grouped[typeId]) {
        grouped[typeId] = {
          typeName,
          tasks: [],
        };
      }
      grouped[typeId].tasks.push(task);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Đang tải...</Typography>
      </Box>
    );
  }

  if (stages.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Chưa có giai đoạn nào</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {stages.map((stage) => {
        const isExpanded = expandedStages[stage.id] || false;
        const tasksByType = groupTasksByType(stage.tasks || []);
        const hasError = stage.error;

        return (
          <StageContainer key={stage.id}>
            {/* Stage Header */}
            <StageHeader onClick={() => toggleStage(stage)}>
              {/* Expand/Collapse Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStage(stage);
                  }}
                  sx={{ p: 0 }}
                >
                  {expandedStages[stage.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* Stage Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.25 }}>
                  {stage.name}
                </Typography>
                {stage.description && (
                  <Typography variant="caption" color="text.secondary">
                    {stage.description}
                  </Typography>
                )}
              </Box>

              {/* Status Badge */}
              {stage.status && (
                <Chip
                  label={stage.status}
                  size="small"
                  variant="outlined"
                  sx={{
                    backgroundColor: alpha(
                      stage.status === 'COMPLETED' ? '#4CAF50' : 
                      stage.status === 'IN_PROGRESS' ? '#2196F3' : 
                      stage.status === 'PENDING' ? '#FFC107' : '#F44336',
                      0.1
                    ),
                    borderColor: 
                      stage.status === 'COMPLETED' ? '#4CAF50' : 
                      stage.status === 'IN_PROGRESS' ? '#2196F3' : 
                      stage.status === 'PENDING' ? '#FFC107' : '#F44336',
                    color: 
                      stage.status === 'COMPLETED' ? '#4CAF50' : 
                      stage.status === 'IN_PROGRESS' ? '#2196F3' : 
                      stage.status === 'PENDING' ? '#FFC107' : '#F44336',
                  }}
                />
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStage?.(stage);
                  }}
                  sx={{
                    color: 'primary.main',
                    '&:hover': { bgcolor: alpha('#1976D2', 0.1) },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStage?.(stage);
                  }}
                  sx={{
                    color: 'error.main',
                    '&:hover': { bgcolor: alpha('#D32F2F', 0.1) },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </StageHeader>

            {/* Stage Content - Tasks grouped by type */}
            <Collapse in={expandedStages[stage.id] || false} timeout="auto">
              <Box sx={{ p: 2 }}>
                {stage.tasksLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Đang tải công việc...
                    </Typography>
                  </Box>
                ) : hasError ? (
                  <Typography color="error" variant="body2">
                    {hasError}
                  </Typography>
                ) : !stage.tasks || stage.tasks.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    Chưa có công việc nào
                  </Typography>
                ) : (
                  <Box>
                    {Object.entries(tasksByType).map(([typeId, { typeName, tasks }], idx) => {
                      const typeKey = `${stage.id}-${typeId}`;
                      const isTypeExpanded = expandedTypes[typeKey] !== false; // Default to true (expanded)
                      
                      return (
                        <TypeContainer key={typeId}>
                          {/* Type Header with collapse button */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1.5,
                              pb: 1,
                              borderBottom: `1px solid ${alpha('#000', 0.1)}`,
                            }}
                          >
                            {/* Collapse button for task type */}
                            <IconButton
                              size="small"
                              onClick={() => toggleTaskType(stage.id, typeId)}
                              sx={{ p: 0, minWidth: 24 }}
                            >
                              {isTypeExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                            
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              sx={{
                                color: 'primary.main',
                                flex: 1,
                              }}
                            >
                              Loại: {typeName}
                            </Typography>
                          </Box>

                          {/* Tasks under this type - collapsed/expanded */}
                          <Collapse in={isTypeExpanded} timeout="auto">
                            <Box>
                              {tasks.map((task, taskIdx) => (
                                <TaskItem 
                                  key={task.id}
                                  onClick={() => onSelectTask?.(task)}
                                  sx={{ cursor: 'pointer' }}
                                >
                                  {/* Task Name */}
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ flex: 1, minWidth: 150 }}
                                  >
                                    {task.name}
                                  </Typography>

                                  {/* Task Status Selector */}
                                  <TaskStatus
                                    size="small"
                                    value={task.state || 'PENDING'}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onChangeStatus?.(task, e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    variant="outlined"
                                  >
                                    {stateTaskOptions.map((option) => (
                                      <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </TaskStatus>
                                </TaskItem>
                              ))}
                            </Box>
                          </Collapse>
                        </TypeContainer>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Collapse>
          </StageContainer>
        );
      })}
    </Box>
  );
}
