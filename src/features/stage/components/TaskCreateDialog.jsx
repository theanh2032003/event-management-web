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
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as FileIcon,
  InsertDriveFile as GenericFileIcon,
} from '@mui/icons-material';
import { formatDateTimeLocal, parseDateTimeLocal } from '../../../shared/utils/dateFormatter';
import { TASK_STATES } from '../../../shared/constants/taskStates';
import projectApi from '../../project/api/project.api';
import supplierApi from '../../supplier/api/supplier.api';
import { uploadToCloudinary } from '../../../shared/utils/uploadToCloudinary';

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
    supplierId: '',
    implementerIds: [],
    supporterIds: [],
    testerIds: [],
    images: [],
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Fetch users and suppliers when dialog opens
  useEffect(() => {
    if (open) {
      if (projectId) {
        fetchUsers();
      }
      fetchSuppliers();
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

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await supplierApi.getSuppliers('', 0, 100, projectId);
      setSuppliers(response.data || response || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

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
          supplierId: task.supplierId || task.supplier?.id || '',
          implementerIds: implementerIds,
          supporterIds: supporterIds,
          testerIds: testerIds,
          images: task.images || [],
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
          supplierId: '',
          implementerIds: [],
          supporterIds: [],
          testerIds: [],
          images: [],
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
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
        implementerIds: formData.implementerIds,
        supporterIds: formData.supporterIds,
        testerIds: formData.testerIds,
        stageId: stageId,
        images: formData.images || [],
      };


      if (isEditMode && onEdit) {
        await onEdit(taskData);
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

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err) {
      console.error("Error uploading files:", err);
      setError("Lỗi khi tải file lên");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle remove image
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Get file extension from URL
  const getFileExtension = (url) => {
    return url.split('.').pop().split('?')[0].toLowerCase();
  };

  // Get icon based on file type
  const getFileIcon = (url) => {
    const ext = getFileExtension(url);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    if (imageExts.includes(ext)) return <ImageIcon />;
    if (videoExts.includes(ext)) return <VideoIcon />;
    if (docExts.includes(ext)) return <FileIcon />;
    return <GenericFileIcon />;
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
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), py: 3 }}>
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
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Giai đoạn"
              fullWidth
              required
              value={stageName}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled
              sx={{ mb: 2 }}
            />

            {/* Task Type */}
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

            {/* State */}
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

            {/* Start Date */}
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

            {/* End Date */}
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
                  options={users || []}
                  getOptionLabel={(option) => option?.name || option?.fullName || option?.email || 'Unknown'}
                  value={getSelectedUsers(formData.implementerIds)}
                  onChange={handleAutocompleteChange("implementerIds")}
                  disabled={submitting || !users || users.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người thực hiện"
                      placeholder={formData.implementerIds.length === 0 ? "Chọn người thực hiện..." : ""}
                      required
                      error={!!validationErrors.implementerIds}
                      helperText={validationErrors.implementerIds}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value && value.map((user, index) => (
                      user && (
                        <Chip
                          key={user?.id}
                          avatar={
                            <Avatar src={user?.avatar}>
                              {(user?.name || user?.fullName || 'U')[0]}
                            </Avatar>
                          }
                          label={user?.name || user?.fullName || user?.email}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      )
                    ))
                  }
                  renderOption={(props, option) => (
                    option && (
                      <Box component="li" {...props} key={option?.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                        <Avatar src={option?.avatar} sx={{ width: 32, height: 32 }}>
                          {(option?.name || option?.fullName || 'U')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{option?.name || option?.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option?.email}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  )}
                  sx={{ mb: 2 }}
                />

                {/* Supporters - Người hỗ trợ */}
                <Autocomplete
                  multiple
                  fullWidth
                  options={users || []}
                  getOptionLabel={(option) => option?.name || option?.fullName || option?.email || 'Unknown'}
                  value={getSelectedUsers(formData.supporterIds)}
                  onChange={handleAutocompleteChange("supporterIds")}
                  disabled={submitting || !users || users.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người hỗ trợ"
                      placeholder={formData.supporterIds.length === 0 ? "Chọn người hỗ trợ..." : ""}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value && value.map((user, index) => (
                      user && (
                        <Chip
                          key={user?.id}
                          avatar={
                            <Avatar src={user?.avatar}>
                              {(user?.name || user?.fullName || 'U')[0]}
                            </Avatar>
                          }
                          label={user?.name || user?.fullName || user?.email}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      )
                    ))
                  }
                  renderOption={(props, option) => (
                    option && (
                      <Box component="li" {...props} key={option?.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                        <Avatar src={option?.avatar} sx={{ width: 32, height: 32 }}>
                          {(option?.name || option?.fullName || 'U')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{option?.name || option?.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option?.email}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  )}
                  sx={{ mb: 2 }}
                />

                {/* Testers - Người kiểm tra */}
                <Autocomplete
                  multiple
                  fullWidth
                  options={users || []}
                  getOptionLabel={(option) => option?.name || option?.fullName || option?.email || 'Unknown'}
                  value={getSelectedUsers(formData.testerIds)}
                  onChange={handleAutocompleteChange("testerIds")}
                  disabled={submitting || !users || users.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người kiểm tra"
                      placeholder={formData.testerIds.length === 0 ? "Chọn người kiểm tra..." : ""}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value && value.map((user, index) => (
                      user && (
                        <Chip
                          key={user?.id}
                          avatar={
                            <Avatar src={user?.avatar}>
                              {(user?.name || user?.fullName || 'U')[0]}
                            </Avatar>
                          }
                          label={user?.name || user?.fullName || user?.email}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      )
                    ))
                  }
                  renderOption={(props, option) => (
                    option && (
                      <Box component="li" {...props} key={option?.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                        <Avatar src={option?.avatar} sx={{ width: 32, height: 32 }}>
                          {(option?.name || option?.fullName || 'U')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{option?.name || option?.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option?.email}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  )}
                />
              </>
            )}

            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
               {/* Supplier */}
                <FormControl fullWidth>
                  <InputLabel>Nhà cung cấp</InputLabel>
                  <Select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    label="Nhà cung cấp"
                    disabled={submitting || loadingSuppliers}
                  >
                    <MenuItem value="">
                      <em>{formData.supplierId ? "Cần ký hợp đồng với nhà cung cấp" : "Cần ký hợp đồng với nhà cung cấp"}</em>
                    </MenuItem>
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </>
            )}

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

                        {/* File Upload */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ 
                position: 'relative',
                width: 80,
                height: 80,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingFiles ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                flexShrink: 0,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }
              }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploadingFiles || submitting}
                  style={{ display: 'none' }}
                  id="file-upload-input"
                />
                <label 
                  htmlFor="file-upload-input" 
                  style={{ 
                    cursor: uploadingFiles ? 'not-allowed' : 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    {uploadingFiles ? (
                      <CircularProgress size={24} />
                    ) : (
                      <CloudUploadIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                    )}
                  </Box>
                </label>
              </Box>
            </Box>

            {/* Files Preview */}
            {formData.images && formData.images.length > 0 && (
              <Box sx={{ 
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                p: 2,
              }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Tệp đã tải lên ({formData.images.length})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 1.5 }}>
                  {formData.images.map((fileUrl, index) => {
                    const ext = getFileExtension(fileUrl);
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
                    
                    return (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingBottom: '100%',
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          '&:hover .image-actions': {
                            opacity: 1,
                          }
                        }}
                      >
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={`preview-${index}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }}
                          >
                            <Box sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                              {getFileIcon(fileUrl)}
                            </Box>
                            <Typography variant="caption" sx={{ fontSize: '9px', textAlign: 'center', px: 0.5 }}>
                              {ext.toUpperCase()}
                            </Typography>
                          </Box>
                        )}
                        <Box
                          className="image-actions"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            bgcolor: alpha(theme.palette.common.black, 0.5),
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => window.open(fileUrl, '_blank')}
                            title="Xem"
                            sx={{
                              color: theme.palette.common.white,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                              }
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            title="Xóa"
                            sx={{
                              color: theme.palette.error.light,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

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
          sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || loadingUsers}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            background: `${theme.palette.primary.main})`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `${theme.palette.primary.dark}`,
            },
          }}
        >
          {submitting ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Tạo công việc'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
