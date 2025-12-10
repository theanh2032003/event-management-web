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
  Grid,
  Paper,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import { 
  Close as CloseIcon,
  Save as SaveIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { formatDateTimeLocal, parseDateTimeLocal } from '../../../shared/utils/dateFormatter';
import { TASK_STATES } from '../../../shared/constants/taskStates';
import projectApi from '../../project/api/project.api';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.875rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

/**
 * TaskCreateDialog - Dialog to create/edit a task
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {number} stageId - Stage ID where task will be created
 * @param {string} stageName - Stage name for display
 * @param {number} taskTypeId - Pre-selected task type ID
 * @param {array} taskTypes - Available task types
 * @param {function} onCreate - Create handler (stageId, taskData)
 * @param {function} onEdit - Edit handler (task, taskData) - optional
 * @param {object} task - Task to edit (null for create mode)
 * @param {boolean} submitting - Submitting state
 * @param {number} projectId - Project ID for fetching users
 */
export default function TaskCreateDialog({
  open,
  onClose,
  stageId,
  stageName,
  taskTypeId,
  taskTypes = [],
  onCreate,
  onEdit,
  task = null,
  submitting = false,
  projectId,
}) {
  const theme = useTheme();
  const isEditMode = !!task;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startedAt: '',
    endedAt: '',
    state: 'PENDING',
    taskTypeId: taskTypeId || '',
    implementerIds: [],
    supporterIds: [],
    testerIds: [],
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users when dialog opens
  useEffect(() => {
    if (open && projectId) {
      fetchUsers();
    }
  }, [open, projectId]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await projectApi.getUsers(projectId);
      setUsers(response.data || response || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        // Edit mode - populate form with existing task data
        const implementerIds = task.implementerIds || (task.implementers || []).map(u => u.id);
        const supporterIds = task.supporterIds || (task.supporters || []).map(u => u.id);
        const testerIds = task.testerIds || (task.testers || []).map(u => u.id);
        
        setFormData({
          name: task.name || '',
          description: task.description || '',
          startedAt: formatDateTimeLocal(task.startedAt),
          endedAt: formatDateTimeLocal(task.endedAt),
          state: task.state || task.stateId || task.taskState?.id || 'PENDING',
          taskTypeId: task.taskTypeId || task.typeId || task.taskType?.id || '',
          implementerIds: implementerIds,
          supporterIds: supporterIds,
          testerIds: testerIds,
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          description: '',
          startedAt: formatDateTimeLocal(new Date()),
          endedAt: formatDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)), // +1 day
          state: 'PENDING',
          taskTypeId: taskTypeId || (taskTypes.length > 0 ? taskTypes[0].id : ''),
          implementerIds: [],
          supporterIds: [],
          testerIds: [],
        });
      }
      setError('');
      setValidationErrors({});
    }
  }, [open, task, taskTypeId, taskTypes]);

  const handleSubmit = async () => {
    setError('');
    setValidationErrors({});

    // Validation
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên công việc';
    }
    if (!formData.taskTypeId) {
      errors.taskTypeId = 'Vui lòng chọn loại công việc';
    }
    if (!formData.startedAt) {
      errors.startedAt = 'Vui lòng chọn thời gian bắt đầu';
    }
    if (!formData.endedAt) {
      errors.endedAt = 'Vui lòng chọn thời gian kết thúc';
    }
    if (formData.implementerIds.length === 0) {
      errors.implementerIds = 'Vui lòng chọn ít nhất một người thực hiện';
    }

    const startDate = new Date(formData.startedAt);
    const endDate = new Date(formData.endedAt);
    if (formData.startedAt && formData.endedAt && endDate <= startDate) {
      errors.endedAt = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const taskData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        startedAt: parseDateTimeLocal(formData.startedAt),
        endedAt: parseDateTimeLocal(formData.endedAt),
        state: formData.state,
        taskTypeId: parseInt(formData.taskTypeId),
        typeId: parseInt(formData.taskTypeId),
        implementerIds: formData.implementerIds,
        supporterIds: formData.supporterIds,
        testerIds: formData.testerIds,
        stageId: stageId,
      };

      if (isEditMode && onEdit) {
        await onEdit(task, taskData);
      } else {
        await onCreate(stageId, taskData);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu công việc');
    }
  };

  // Helper to get selected users by IDs
  const getSelectedUsers = (ids) => {
    return users.filter((user) => ids.includes(user.id));
  };

  const handleAutocompleteChange = (field) => (event, newValue) => {
    const ids = newValue.map((user) => user.id);
    setFormData((prev) => ({ ...prev, [field]: ids }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.default, 0.95)})`,
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEditMode ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Giai đoạn: {stageName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Basic Info Section */}
          <StyledPaper elevation={0}>
            <SectionTitle>
              <DescriptionIcon fontSize="small" />
              Thông tin cơ bản
            </SectionTitle>

            {/* Task Name */}
            <TextField
              label="Tên công việc"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên công việc..."
              disabled={submitting}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              sx={{ mb: 2 }}
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
          </StyledPaper>

          {/* Type & Status Section */}
          <StyledPaper elevation={0}>
            <SectionTitle>
              <CategoryIcon fontSize="small" />
              Phân loại & Thời gian
            </SectionTitle>

            <Grid container spacing={2}>
              {/* Task Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validationErrors.taskTypeId}>
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
                  {validationErrors.taskTypeId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.taskTypeId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Thời gian bắt đầu"
                  type="datetime-local"
                  fullWidth
                  required
                  value={formData.startedAt}
                  onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  disabled={submitting}
                  error={!!validationErrors.startedAt}
                  helperText={validationErrors.startedAt}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Thời gian kết thúc"
                  type="datetime-local"
                  fullWidth
                  required
                  value={formData.endedAt}
                  onChange={(e) => setFormData({ ...formData, endedAt: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  disabled={submitting}
                  error={!!validationErrors.endedAt}
                  helperText={validationErrors.endedAt}
                />
              </Grid>
            </Grid>
          </StyledPaper>

          {/* Personnel Section */}
          <StyledPaper elevation={0}>
            <SectionTitle>
              <PeopleIcon fontSize="small" />
              Phân công nhân sự
              <Chip 
                label={formData.implementerIds.length + formData.supporterIds.length + formData.testerIds.length} 
                size="small" 
                color="primary"
                sx={{ ml: 1, fontWeight: 700 }}
              />
            </SectionTitle>

            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
                {/* Implementers - Người thực hiện */}
                <Autocomplete
                  multiple
                  fullWidth
                  options={users}
                  getOptionLabel={(option) => option.name || option.fullName || option.email || 'Unknown'}
                  value={getSelectedUsers(formData.implementerIds)}
                  onChange={handleAutocompleteChange("implementerIds")}
                  disabled={submitting || users.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người thực hiện"
                      placeholder="Chọn người thực hiện..."
                      required
                      error={!!validationErrors.implementerIds}
                      helperText={validationErrors.implementerIds}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((user, index) => (
                      <Chip
                        key={user.id}
                        avatar={
                          <Avatar src={user.avatar}>
                            {(user.name || user.fullName || 'U')[0]}
                          </Avatar>
                        }
                        label={user.name || user.fullName || user.email}
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                      <Avatar src={option.avatar} sx={{ width: 32, height: 32 }}>
                        {(option.name || option.fullName || 'U')[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name || option.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  sx={{ mb: 2 }}
                />

                {/* Supporters - Người hỗ trợ */}
                <Autocomplete
                  multiple
                  fullWidth
                  options={users}
                  getOptionLabel={(option) => option.name || option.fullName || option.email || 'Unknown'}
                  value={getSelectedUsers(formData.supporterIds)}
                  onChange={handleAutocompleteChange("supporterIds")}
                  disabled={submitting || users.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người hỗ trợ"
                      placeholder="Chọn người hỗ trợ..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((user, index) => (
                      <Chip
                        key={user.id}
                        avatar={
                          <Avatar src={user.avatar}>
                            {(user.name || user.fullName || 'U')[0]}
                          </Avatar>
                        }
                        label={user.name || user.fullName || user.email}
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                      <Avatar src={option.avatar} sx={{ width: 32, height: 32 }}>
                        {(option.name || option.fullName || 'U')[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name || option.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  sx={{ mb: 2 }}
                />

                {/* Testers - Người kiểm tra */}
                <Autocomplete
                  multiple
                  fullWidth
                  options={users}
                  getOptionLabel={(option) => option.name || option.fullName || option.email || 'Unknown'}
                  value={getSelectedUsers(formData.testerIds)}
                  onChange={handleAutocompleteChange("testerIds")}
                  disabled={submitting || users.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người kiểm tra"
                      placeholder="Chọn người kiểm tra..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((user, index) => (
                      <Chip
                        key={user.id}
                        avatar={
                          <Avatar src={user.avatar}>
                            {(user.name || user.fullName || 'U')[0]}
                          </Avatar>
                        }
                        label={user.name || user.fullName || user.email}
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                      <Avatar src={option.avatar} sx={{ width: 32, height: 32 }}>
                        {(option.name || option.fullName || 'U')[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name || option.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </>
            )}
          </StyledPaper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`,
          gap: 1.5,
        }}
      >
        <Button 
          onClick={onClose} 
          disabled={submitting}
          startIcon={<CloseIcon />}
          sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || loadingUsers}
          startIcon={submitting ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          }}
        >
          {submitting ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Tạo công việc'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
