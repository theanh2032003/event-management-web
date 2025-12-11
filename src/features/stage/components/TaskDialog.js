import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip,
  Avatar,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Paper,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  alpha,
  styled,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  People as PeopleIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useStageTaskFormData } from "../../../shared/hooks/useStageTaskFormData";

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

const TaskDialog = ({ open, onClose, onSave, task, stageId, projectId, enterpriseId, submitting, taskStates: propTaskStates, taskTypes: propTaskTypes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch users from stage, task states, and task types with retry logic
  const { users, taskStates: hookTaskStates, taskTypes: hookTaskTypes, loading: dataLoading, error: dataError } = useStageTaskFormData(projectId, stageId, enterpriseId);
  
  // Use prop taskStates if provided, otherwise use hook taskStates
  const taskStates = propTaskStates && propTaskStates.length > 0 ? propTaskStates : hookTaskStates;
  
  // Use prop taskTypes if provided, otherwise use hook taskTypes
  const taskTypes = propTaskTypes && propTaskTypes.length > 0 ? propTaskTypes : hookTaskTypes;

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    images: [],
    supporterIds: [],
    testerIds: [],
    implementerIds: [],
    state: null,
    typeId: null,
  });
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (task) {
        // Editing existing task
        // Extract IDs from arrays or use existing IDs
        const implementerIds = task.implementerIds || (task.implementers || []).map(u => u.id);
        const supporterIds = task.supporterIds || (task.supporters || []).map(u => u.id);
        const testerIds = task.testerIds || (task.testers || []).map(u => u.id);
        
        setFormState({
          name: task.name || "",
          description: task.description || "",
          images: task.images || [],
          supporterIds: supporterIds,
          testerIds: testerIds,
          implementerIds: implementerIds,
          stateId: task.stateId || task.taskState?.id || null,
          typeId: task.typeId || task.taskType?.id || null,
        });
        setImageUrls(task.images || []);
      } else {
        // Creating new task - set defaults
        setFormState({
          name: "",
          description: "",
          images: [],
          supporterIds: [],
          testerIds: [],
          implementerIds: [],
          state: null,
          typeId: null,
        });
        setImageUrls([]);
      }
      setError("");
      setValidationErrors({});
    }
  }, [task, open]);

  // Set default state and typeId when data is loaded (only once)
  useEffect(() => {
    if (open && !task && taskStates.length > 0 && taskTypes.length > 0) {
      setFormState((prev) => {
        // Only update if not already set
        if (prev.state === null && prev.typeId === null) {
          return {
            ...prev,
            state: taskStates[0].id,
            typeId: taskTypes[0].id,
          };
        }
        return prev;
      });
    }
  }, [open, task, taskStates.length, taskTypes.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (field) => (event, newValue) => {
    const ids = newValue.map((user) => user.id);
    setFormState((prev) => ({ ...prev, [field]: ids }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadingImage(true);

    // Simulate upload and convert to URLs
    // In production, you would upload to a server and get back URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImageUrls((prev) => [...prev, imageUrl]);
        setFormState((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setError("");
    setValidationErrors({});
    
    console.log("📝 TaskDialog - handleSave called");
    console.log("📝 Current formState:", formState);
    console.log("📝 Form state details:", {
      name: formState.name,
      description: formState.description,
      state: formState.state,
      stateType: typeof formState.state,
      typeId: formState.typeId,
      typeIdType: typeof formState.typeId,
      implementerIds: formState.implementerIds,
      implementerIdsLength: formState.implementerIds?.length,
      testerIds: formState.testerIds,
      testerIdsLength: formState.testerIds?.length,
      supporterIds: formState.supporterIds,
      supporterIdsLength: formState.supporterIds?.length,
      images: formState.images,
      imagesLength: formState.images?.length,
      isEditMode: !!task
    });
    
    // Client-side validation
    const errors = {};
    
    if (!formState.name.trim()) {
      errors.name = "Tên công việc không được để trống";
    }
    if (!formState.state) {
      errors.state = "Vui lòng chọn trạng thái công việc";
    }
    if (!formState.typeId) {
      errors.typeId = "Vui lòng chọn loại công việc";
    }
    if (formState.implementerIds.length === 0) {
      errors.implementerIds = "Vui lòng chọn ít nhất một người thực hiện";
    }
    if (formState.testerIds.length === 0) {
      errors.testerIds = "Vui lòng chọn ít nhất một người kiểm tra";
    }
    // if (formState.supporterIds.length === 0) {
    //   errors.testerIds = "Vui lòng chọn ít nhất một người hỗ trợ";
    // }
    if (Object.keys(errors).length > 0) {
      console.log("❌ Validation errors:", errors);
      setValidationErrors(errors);
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    console.log("✅ Validation passed, calling onSave...");
    try {
      await onSave(formState);
      console.log("✅ onSave completed successfully");
    } catch (err) {
      console.error("❌ onSave error caught:", err);
      // Handle API validation errors
      if (err.response?.data) {
        const apiErrors = err.response.data;
        
        // Check if it's a validation error object
        if (typeof apiErrors === 'object' && !apiErrors.message) {
          setValidationErrors(apiErrors);
          setError("Vui lòng kiểm tra lại thông tin");
        } else {
          setError(apiErrors.message || "Có lỗi xảy ra khi lưu công việc");
        }
      } else {
        setError(err.message || "Có lỗi xảy ra khi lưu công việc");
      }
    }
  };

  // Helper to get selected users by IDs
  const getSelectedUsers = (ids) => {
    return users.filter((user) => ids.includes(user.id));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      disableRestoreFocus
      keepMounted={false}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.default, 0.95)})`,
        },
      }}
    >
      {/* Header with Gradient */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <AssignmentIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {task ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {task ? "Cập nhật thông tin công việc" : "Thêm công việc mới vào giai đoạn"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: alpha(theme.palette.grey[500], 0.1),
            "&:hover": {
              bgcolor: alpha(theme.palette.grey[500], 0.2),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {dataLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={48} />
            </Box>
          ) : dataError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{dataError}</Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              
              {/* Basic Info Section */}
              <StyledPaper elevation={0}>
                <SectionTitle>
                  <DescriptionIcon fontSize="small" />
                  Thông tin cơ bản
                </SectionTitle>
                
                {/* Task Name */}
                <TextField
                  name="name"
                  label="Tên công việc"
                  fullWidth
                  required
                  value={formState.name}
                  onChange={handleChange}
                  disabled={submitting}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  placeholder="Nhập tên công việc"
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    },
                  }}
                />

                {/* Task Description */}
                <TextField
                  name="description"
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  value={formState.description}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="Mô tả chi tiết về công việc"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    },
                  }}
                />
              </StyledPaper>

              {/* Image Upload Section */}
              <StyledPaper elevation={0}>
                <SectionTitle>
                  <ImageIcon fontSize="small" />
                  Hình ảnh
                  <Chip 
                    label={imageUrls.length} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1, fontWeight: 700 }}
                  />
                </SectionTitle>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={submitting || uploadingImage}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderStyle: "dashed",
                      borderWidth: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  {uploadingImage ? "Đang tải..." : "Tải lên hình ảnh"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {imageUrls.length > 0 && (
                  <ImageList sx={{ width: "100%", maxHeight: 220, mt: 2, borderRadius: 2 }} cols={3} rowHeight={120}>
                    {imageUrls.map((url, index) => (
                      <ImageListItem key={index} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          loading="lazy"
                          style={{ objectFit: "cover", height: "100%" }}
                        />
                        <ImageListItemBar
                          sx={{
                            background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                          }}
                          position="top"
                          actionIcon={
                            <IconButton
                              sx={{ 
                                color: "white",
                                "&:hover": {
                                  bgcolor: alpha("#fff", 0.2),
                                },
                              }}
                              onClick={() => handleRemoveImage(index)}
                              disabled={submitting}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          }
                          actionPosition="right"
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </StyledPaper>

              {/* Type & Status Section */}
              <StyledPaper elevation={0}>
                <SectionTitle>
                  <CategoryIcon fontSize="small" />
                  Phân loại & Trạng thái
                </SectionTitle>
                
                <Grid container spacing={2}>
                  {/* Task Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!validationErrors.typeId}>
                      <InputLabel>Loại công việc</InputLabel>
                      <Select
                        name="typeId"
                        value={formState.typeId || ""}
                        onChange={handleChange}
                        label="Loại công việc"
                        disabled={submitting || taskTypes.length === 0}
                        sx={{
                          borderRadius: 2,
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                        renderValue={(selected) => {
                          if (!selected) return "";
                          const type = taskTypes.find((t) => t.id === selected);
                          return type ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  backgroundColor: type.color,
                                  boxShadow: `0 0 8px ${alpha(type.color, 0.4)}`,
                                }}
                              />
                              <Typography>{type.name}</Typography>
                            </Box>
                          ) : "";
                        }}
                      >
                        {taskTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  backgroundColor: type.color,
                                  boxShadow: `0 0 8px ${alpha(type.color, 0.4)}`,
                                }}
                              />
                              <Typography>{type.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {validationErrors.typeId && (
                        <FormHelperText>{validationErrors.typeId}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Task State */}
                  {/* <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!validationErrors.state}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        name="state"
                        value={formState.state || ""}
                        onChange={handleChange}
                        label="Trạng thái"
                        disabled={submitting || taskStates.length === 0}
                        sx={{
                          borderRadius: 2,
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                        renderValue={(selected) => {
                          if (!selected) return "";
                          const state = taskStates.find((s) => s.id === selected);
                          return state ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  backgroundColor: state.color,
                                  boxShadow: `0 0 8px ${alpha(state.color, 0.4)}`,
                                }}
                              />
                              <Typography>{state.name}</Typography>
                            </Box>
                          ) : "";
                        }}
                      >
                        {taskStates.map((state) => (
                          <MenuItem key={state.id} value={state.id}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 16,
                                height: 16,
                                borderRadius: "50%",
                                backgroundColor: state.color,
                              }}
                            />
                            <Typography>{state.name}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.state && (
                      <FormHelperText>{validationErrors.state}</FormHelperText>
                    )}
                  </FormControl>
                </Grid> */}
              </Grid>
              </StyledPaper>

              {/* Personnel Section */}
              <StyledPaper elevation={0}>
                <SectionTitle>
                  <PeopleIcon fontSize="small" />
                  Nhân sự tham gia
                  <Chip 
                    label={formState.implementerIds.length + formState.supporterIds.length + formState.testerIds.length} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1, fontWeight: 700 }}
                  />
                </SectionTitle>

                {/* Implementers */}
                <Autocomplete
                multiple
                fullWidth
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={getSelectedUsers(formState.implementerIds)}
                onChange={handleAutocompleteChange("implementerIds")}
                disabled={submitting || users.length === 0}
                disablePortal={false}
                componentsProps={{
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [
                      {
                        name: 'flip',
                        enabled: true,
                      },
                      {
                        name: 'preventOverflow',
                        enabled: true,
                        options: {
                          boundary: 'viewport',
                        },
                      },
                    ],
                  },
                  paper: {
                    sx: {
                      width: '100%',
                      minWidth: '400px',
                      maxWidth: '600px',
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField  
                    {...params}
                    fullWidth
                    label="Người thực hiện" 
                    required
                    placeholder="Chọn người thực hiện"
                    error={!!validationErrors.implementerIds}
                    helperText={validationErrors.implementerIds}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      sx: { 
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      },
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={option.avatar ? <Avatar src={option.avatar} /> : <Avatar>{option.name[0]}</Avatar>}
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                    <Avatar src={option.avatar} sx={{ width: 32, height: 32, flexShrink: 0 }}>
                      {option.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />

              <Box sx={{ height: 12 }} />  
              {/* Supporters */}
              <Autocomplete
                multiple
                fullWidth
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={getSelectedUsers(formState.supporterIds)}
                onChange={handleAutocompleteChange("supporterIds")}
                disabled={submitting || users.length === 0}
                disablePortal={false}
                componentsProps={{
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [
                      {
                        name: 'flip',
                        enabled: true,
                      },
                      {
                        name: 'preventOverflow',
                        enabled: true,
                        options: {
                          boundary: 'viewport',
                        },
                      },
                    ],
                  },
                  paper: {
                    sx: {
                      width: '100%',
                      minWidth: '400px',
                      maxWidth: '600px',
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params}
                    fullWidth
                    label="Người hỗ trợ"
                    placeholder="Chọn người hỗ trợ"
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      sx: { 
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      },
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={option.avatar ? <Avatar src={option.avatar} /> : <Avatar>{option.name[0]}</Avatar>}
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                    <Avatar src={option.avatar} sx={{ width: 32, height: 32, flexShrink: 0 }}>
                      {option.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
              <Box sx={{ height: 12 }} />  

              {/* Testers */}
              <Autocomplete
                multiple
                fullWidth
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={getSelectedUsers(formState.testerIds)}
                onChange={handleAutocompleteChange("testerIds")}
                disabled={submitting || users.length === 0}
                disablePortal={false}
                componentsProps={{
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [
                      {
                        name: 'flip',
                        enabled: true,
                      },
                      {
                        name: 'preventOverflow',
                        enabled: true,
                        options: {
                          boundary: 'viewport',
                        },
                      },
                    ],
                  },
                  paper: {
                    sx: {
                      width: '100%',
                      minWidth: '400px',
                      maxWidth: '600px',
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params}
                    fullWidth
                    label="Người kiểm tra"
                    placeholder="Chọn người kiểm tra" 
                    required
                    error={!!validationErrors.testerIds}
                    helperText={validationErrors.testerIds}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      sx: { 
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      },
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={option.avatar ? <Avatar src={option.avatar} /> : <Avatar>{option.name[0]}</Avatar>}
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                    <Avatar src={option.avatar} sx={{ width: 32, height: 32, flexShrink: 0 }}>
                      {option.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
              </StyledPaper>
            </>
          )}
        </Box>
      </DialogContent>
      
      {/* Footer with Gradient */}
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
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={submitting || dataLoading}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {submitting ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
