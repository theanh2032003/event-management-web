import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  Autocomplete,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { formatDateTimeLocal, parseDateTimeLocal } from '../../../shared/utils/dateFormatter';
import { TASK_STATES } from '../../../shared/constants/taskStates';

/**
 * TaskCreateDialog - Dialog to create a new task
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {number} stageId - Stage ID where task will be created
 * @param {string} stageName - Stage name for display
 * @param {number} taskTypeId - Pre-selected task type ID
 * @param {array} taskTypes - Available task types
 * @param {array} users - Available users for assignment
 * @param {function} onCreate - Create handler
 * @param {boolean} submitting - Submitting state
 */
export default function TaskCreateDialog({
  open,
  onClose,
  stageId,
  stageName,
  taskTypeId,
  taskTypes = [],
  users = [],
  onCreate,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startedAt: '',
    endedAt: '',
    stateId: 'PENDING',
    taskTypeId: taskTypeId || '',
    userIds: [],
  });
  const [error, setError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        startedAt: formatDateTimeLocal(new Date()),
        endedAt: formatDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)), // +1 day
        stateId: 'PENDING',
        taskTypeId: taskTypeId || (taskTypes.length > 0 ? taskTypes[0].id : ''),
        userIds: [],
      });
      setError('');
    }
  }, [open, taskTypeId, taskTypes]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên công việc');
      return;
    }
    if (!formData.taskTypeId) {
      setError('Vui lòng chọn loại công việc');
      return;
    }
    if (!formData.startedAt) {
      setError('Vui lòng chọn thời gian bắt đầu');
      return;
    }
    if (!formData.endedAt) {
      setError('Vui lòng chọn thời gian kết thúc');
      return;
    }

    const startDate = new Date(formData.startedAt);
    const endDate = new Date(formData.endedAt);
    if (endDate <= startDate) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    try {
      await onCreate(stageId, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        startedAt: parseDateTimeLocal(formData.startedAt),
        endedAt: parseDateTimeLocal(formData.endedAt),
        stateId: formData.stateId,
        taskTypeId: parseInt(formData.taskTypeId),
        userIds: formData.userIds,
        stageId: stageId,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo công việc');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Tạo công việc mới
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Giai đoạn: {stageName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Task Name */}
          <TextField
            label="Tên công việc"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên công việc..."
            disabled={submitting}
          />

          {/* Description */}
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nhập mô tả công việc..."
            disabled={submitting}
          />

          {/* Task Type */}
          <FormControl fullWidth required>
            <InputLabel>Loại công việc</InputLabel>
            <Select
              value={formData.taskTypeId}
              onChange={(e) => setFormData({ ...formData, taskTypeId: e.target.value })}
              label="Loại công việc"
              disabled={submitting}
            >
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
                    {type.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* State */}
          <FormControl fullWidth required>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={formData.stateId}
              onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
              label="Trạng thái"
              disabled={submitting}
            >
              {TASK_STATES.map((state) => (
                <MenuItem key={state.id} value={state.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: state.color,
                      }}
                    />
                    {state.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start/End Dates */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              fullWidth
              required
              value={formData.startedAt}
              onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
            />
            <TextField
              label="Thời gian kết thúc"
              type="datetime-local"
              fullWidth
              required
              value={formData.endedAt}
              onChange={(e) => setFormData({ ...formData, endedAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
            />
          </Box>

          {/* Assigned Users */}
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(user) => user.fullName || user.email || 'Unknown'}
            value={users.filter((u) => formData.userIds.includes(u.id))}
            onChange={(e, newValue) => {
              setFormData({ ...formData, userIds: newValue.map((u) => u.id) });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Phân công" placeholder="Chọn người thực hiện..." />
            )}
            renderTags={(value, getTagProps) =>
              value.map((user, index) => (
                <Chip
                  key={user.id}
                  avatar={<Avatar src={user.avatar}>{user.fullName?.[0] || 'U'}</Avatar>}
                  label={user.fullName || user.email}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
            disabled={submitting}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? 'Đang tạo...' : 'Tạo công việc'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
