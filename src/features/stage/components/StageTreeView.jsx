import React, { useState, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Tooltip,
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
  FilterList as FilterListIcon,
  Clear as ClearIcon,
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

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  flexWrap: 'wrap',
}));

// Stage status options - PENDING, IN_PROGRESS, SUCCESS, CANCELED
const stageStatusOptions = [
  { value: 'PENDING', label: 'Chờ xử lý', color: '#FFA726', icon: HourglassEmptyIcon },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#42A5F5', icon: PlayArrowIcon },
  { value: 'SUCCESS', label: 'Hoàn thành', color: '#66BB6A', icon: CheckCircleIcon },
  { value: 'CANCELED', label: 'Hủy bỏ', color: '#EF5350', icon: CancelIcon },
];

// Task status options - PENDING, IN_PROGRESS, DONE, CANCELLED
const taskStatusOptions = [
  { value: 'PENDING', label: 'Chờ xử lý', color: '#FFA726', icon: HourglassEmptyIcon },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#42A5F5', icon: PlayArrowIcon },
  { value: 'DONE', label: 'Hoàn thành', color: '#66BB6A', icon: CheckCircleIcon },
  { value: 'CANCELLED', label: 'Hủy bỏ', color: '#EF5350', icon: CancelIcon },
];

const getStageStatusInfo = (status) => {
  const found = stageStatusOptions.find(s => s.value === status);
  return found || { label: status || 'Đang chờ', color: '#757575', icon: HourglassEmptyIcon };
};

const getTaskStatusInfo = (status) => {
  const found = taskStatusOptions.find(s => s.value === status);
  return found || { label: status || 'Đang chờ', color: '#757575', icon: HourglassEmptyIcon };
};

/**
 * StageTreeView - Hiển thị các giai đoạn dạng cây
 */
export default function StageTreeView({
  stages = [],
  taskTypes = [],
  onEditStage,
  onDeleteStage,
  onChangeStageStatus,
  onChangeTaskStatus,
  onSelectTask,
  onToggleStage,
  onAddTask,
  loading = false,
}) {
  const [expandedStages, setExpandedStages] = useState({});
  // Filter state for each stage: { [stageId]: { status: '', typeId: '' } }
  const [stageFilters, setStageFilters] = useState({});

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

  // Handle filter change for a stage
  const handleFilterChange = (stageId, filterType, value) => {
    setStageFilters(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        [filterType]: value,
      }
    }));
  };

  // Clear all filters for a stage
  const clearFilters = (stageId) => {
    setStageFilters(prev => ({
      ...prev,
      [stageId]: { status: '', typeId: '' }
    }));
  };

  // Get filtered tasks for a stage
  const getFilteredTasks = (stageId, tasks) => {
    const filters = stageFilters[stageId] || {};
    let filtered = [...tasks];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(task => task.state === filters.status);
    }

    // Filter by task type
    if (filters.typeId) {
      filtered = filtered.filter(task => {
        const taskTypeId = task.taskTypeId || task.taskType?.id;
        return taskTypeId === filters.typeId;
      });
    }

    return filtered;
  };

  // Check if any filter is active for a stage
  const hasActiveFilters = (stageId) => {
    const filters = stageFilters[stageId] || {};
    return !!(filters.status || filters.typeId);
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
        const filteredTasks = getFilteredTasks(stage.id, tasks);
        const currentFilters = stageFilters[stage.id] || {};

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

              {/* Stage Status Select */}
              <Select
                  size="small"
                value={stage.status || 'PENDING'}
                onChange={(e) => {
                  e.stopPropagation();
                  onChangeStageStatus?.(stage, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                  variant="outlined"
                  sx={{
                  minWidth: 160,
                  height: 36,
                  '& .MuiOutlinedInput-input': {
                    padding: '6px 12px',
                    fontSize: '0.875rem',
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
                renderValue={(value) => {
                  const statusInfo = getStageStatusInfo(value);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusIcon sx={{ fontSize: 18, color: statusInfo.color }} />
                      <Typography variant="body2" sx={{ color: statusInfo.color, fontWeight: 600 }}>
                        {statusInfo.label}
                      </Typography>
                    </Box>
                  );
                }}
              >
                {stageStatusOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <OptionIcon sx={{ fontSize: 18, color: option.color }} />
                        <Typography sx={{ color: option.color }}>{option.label}</Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>

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
                    {/* Filter Bar */}
                    <FilterBar>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Lọc:
                        </Typography>
                      </Box>

                      {/* Status Filter */}
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                          value={currentFilters.status || ''}
                          onChange={(e) => handleFilterChange(stage.id, 'status', e.target.value)}
                          label="Trạng thái"
                          sx={{
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                            },
                          }}
                        >
                          <MenuItem value="">
                            <Typography color="text.secondary">Tất cả trạng thái</Typography>
                          </MenuItem>
                          {taskStatusOptions.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <MenuItem key={option.value} value={option.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <OptionIcon sx={{ fontSize: 18, color: option.color }} />
                                  <Typography sx={{ color: option.color }}>{option.label}</Typography>
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      {/* Task Type Filter */}
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Phân loại</InputLabel>
                        <Select
                          value={currentFilters.typeId || ''}
                          onChange={(e) => handleFilterChange(stage.id, 'typeId', e.target.value)}
                          label="Phân loại"
                        >
                          <MenuItem value="">
                            <Typography color="text.secondary">Tất cả phân loại</Typography>
                          </MenuItem>
                          {taskTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: type.color || '#757575',
                                  }}
                                />
                                <Typography>{type.name}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Clear Filters Button */}
                      {hasActiveFilters(stage.id) && (
                        <Tooltip title="Xóa bộ lọc">
                          <IconButton
                            size="small"
                            onClick={() => clearFilters(stage.id)}
                            sx={{
                              color: 'error.main',
                              '&:hover': { bgcolor: alpha('#D32F2F', 0.1) },
                            }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Filter Result Count */}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                        Hiển thị {filteredTasks.length}/{tasks.length} công việc
                      </Typography>
                    </FilterBar>

                    <StyledTableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <StyledTableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Tên công việc</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Phân loại</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Trạng thái</TableCell>
                          </TableRow>
                        </StyledTableHead>
                        <TableBody>
                          {filteredTasks.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                <Typography color="text.secondary" variant="body2">
                                  Không có công việc nào phù hợp với bộ lọc
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredTasks.map((task) => {
                              const statusInfo = getTaskStatusInfo(task.state || 'PENDING');
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
                                    <Select
                                      size="small"
                                      value={task.state || 'PENDING'}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                          onChangeTaskStatus?.(task, e.target.value);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      variant="outlined"
                                      sx={{
                                          minWidth: 160,
                                        height: 32,
                                        '& .MuiOutlinedInput-input': {
                                          padding: '6px 12px',
                                          fontSize: '0.875rem',
                                        },
                                      }}
                                        renderValue={(value) => {
                                          const info = getTaskStatusInfo(value);
                                          const StatusIcon = info.icon;
                                          return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <StatusIcon sx={{ fontSize: 16, color: info.color }} />
                                              <Typography variant="body2" sx={{ color: info.color, fontWeight: 500 }}>
                                                {info.label}
                                              </Typography>
                                            </Box>
                                          );
                                        }}
                                      >
                                        {taskStatusOptions.map((option) => {
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
                            })
                          )}
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
