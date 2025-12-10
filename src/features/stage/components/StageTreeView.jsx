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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PlayArrow as PlayArrowIcon,
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&:last-child td': {
    borderBottom: 0,
  },
}));

const AddTaskButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

const statusOptions = [
  { value: 'PENDING', label: 'Chưa bắt đầu', color: '#FFA726', icon: HourglassEmptyIcon },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#42A5F5', icon: PlayArrowIcon },
  { value: 'SUCCESS', label: 'Hoàn thành', color: '#66BB6A', icon: CheckCircleIcon },
  { value: 'CANCEL', label: 'Hủy bỏ', color: '#EF5350', icon: CancelIcon },
];

const getStatusInfo = (status) => {
  const found = statusOptions.find(s => s.value === status);
  return found || { label: status, color: '#757575', icon: HourglassEmptyIcon };
};

/**
 * StageTreeView - Hiển thị các giai đoạn dạng cây
 */
export default function StageTreeView({
  stages = [],
  taskTypes = [],
  onEditStage,
  onDeleteStage,
  onChangeStatus,
  onSelectTask,
  onToggleStage,
  onAddTask,
  loading = false,
}) {
  const [expandedStages, setExpandedStages] = useState({});

  const toggleStage = (stage) => {
    const stageId = stage.id;
    const isExpanding = !expandedStages[stageId];
    
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));

    if (isExpanding) {
      onToggleStage?.(stageId);
    }
  };

  const getTaskTypeName = (taskTypeId) => {
    const type = taskTypes.find(t => t.id === taskTypeId);
    return type?.name || 'Chưa phân loại';
  };

  const getTaskTypeColor = (taskTypeId) => {
    const type = taskTypes.find(t => t.id === taskTypeId);
    return type?.color || '#757575';
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
        const tasks = stage.tasks || [];
        const hasError = stage.error;

        return (
          <StageContainer key={stage.id}>
            <StageHeader onClick={() => toggleStage(stage)}>
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
                ) : tasks.length === 0 ? (
                  <AddTaskButton onClick={() => onAddTask?.(stage.id, taskTypes[0]?.id)}>
                    <AddIcon color="primary" />
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      Thêm công việc đầu tiên
                    </Typography>
                  </AddTaskButton>
                ) : (
                  <>
                    <StyledTableContainer component={Paper}>
                      <Table size="small">
                        <StyledTableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Tên công việc</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Phân loại</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Trạng thái</TableCell>
                          </TableRow>
                        </StyledTableHead>
                        <TableBody>
                          {tasks.map((task) => {
                            const statusInfo = getStatusInfo(task.state || 'PENDING');
                            const StatusIcon = statusInfo.icon;
                            const taskTypeColor = getTaskTypeColor(task.taskTypeId || task.taskType?.id);
                            
                            return (
                              <StyledTableRow 
                                key={task.id}
                                onClick={() => onSelectTask?.(task)}
                              >
                                <TableCell>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={600}
                                    sx={{ 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {task.name}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    label={getTaskTypeName(task.taskTypeId || task.taskType?.id)}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(taskTypeColor, 0.15),
                                      color: taskTypeColor,
                                      fontWeight: 600,
                                      border: `1px solid ${alpha(taskTypeColor, 0.3)}`,
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <Box 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 1,
                                    }}
                                  >
                                    {/* <StatusIcon 
                                      sx={{ 
                                        fontSize: 20, 
                                        color: statusInfo.color,
                                      }} 
                                    /> */}
                                    <Select
                                      size="small"
                                      value={task.state || 'PENDING'}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        onChangeStatus?.(task, e.target.value);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      variant="outlined"
                                      sx={{
                                        minWidth: 140,
                                        height: 32,
                                        '& .MuiOutlinedInput-input': {
                                          padding: '6px 12px',
                                          fontSize: '0.875rem',
                                        },
                                      }}
                                    >
                                      {statusOptions.map((option) => {
                                        const OptionIcon = option.icon;
                                        return (
                                          <MenuItem key={option.value} value={option.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <OptionIcon sx={{ fontSize: 18, color: option.color }} />
                                              {option.label}
                                            </Box>
                                          </MenuItem>
                                        );
                                      })}
                                    </Select>
                                  </Box>
                                </TableCell>

                                
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </StyledTableContainer>

                    <AddTaskButton onClick={() => onAddTask?.(stage.id, taskTypes[0]?.id)}>
                      <AddIcon color="primary" />
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        Thêm công việc mới
                      </Typography>
                    </AddTaskButton>
                  </>
                )}
              </Box>
            </Collapse>
          </StageContainer>
        );
      })}
    </Box>
  );
}
