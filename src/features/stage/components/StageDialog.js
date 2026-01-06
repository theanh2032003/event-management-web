import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Grid,
  MenuItem,
  Autocomplete,
  Chip,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
  styled,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Layers as LayersIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  formatDateTimeLocal,
  getCurrentDateTimeLocal,
} from "../../../shared/utils/dateFormatter";
import projectApi from "../../project/api/project.api";
import { useToast } from "../../../app/providers/ToastContext";

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
 * StageDialog - Modal for creating/editing stages
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {object|null} stage - Stage to edit (null for create)
 * @param {function} onSave - Save handler
 * @param {boolean} submitting - Submitting state
 * @param {boolean} isMobile - Mobile view flag
 * @param {number} projectId - Project ID for fetching users
 */
const StageDialog = ({
  open,
  onClose,
  stage,
  onSave,
  submitting,
  isMobile,
  projectId,
}) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [stageForm, setStageForm] = useState({
    name: "",
    description: "",
    startedAt: "",
    endedAt: "",
    userIds: [],
  });
  const [users, setUsers] = useState([]);
  const [usersFetched, setUsersFetched] = useState(false);

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, projectId]);

  const fetchUsers = async () => {
    // Prevent multiple fetch calls
    if (usersFetched) return;

    try {
      const response = await projectApi.getUsers(projectId);
      setUsers(response.data || response || []);
      setUsersFetched(true);
    } catch (err) {
      showToast("Không thể tải danh sách người dùng", "error");
      setUsers([]);
    }
  };

  // Initialize form when dialog opens or stage changes
  useEffect(() => {
    if (open) {
      if (stage) {
        // Edit mode
        const userIds = stage.userIds || (stage.users || []).map(u => u.id);
        setStageForm({
          name: stage.name || "",
          description: stage.description || "",
          startedAt: formatDateTimeLocal(stage.startedAt),
          endedAt: formatDateTimeLocal(stage.endedAt),
          userIds: userIds,
        });
      } else {
        // Create mode
        setStageForm({
          name: "",
          description: "",
          startedAt: getCurrentDateTimeLocal(),
          endedAt: getCurrentDateTimeLocal(),
          userIds: [],
        });
      }
      setError("");
    }
  }, [open, stage]);

  // Validate and save
  const handleSave = () => {
    setError("");

    // Validation
    if (!stageForm.name.trim()) {
      setError("Tên giai đoạn là bắt buộc");
      return;
    }

    // if (!stageForm.description.trim()) {
    //   setError("Mô tả là bắt buộc");
    //   return;
    // }

    if (!stageForm.startedAt) {
      setError("Thời gian bắt đầu là bắt buộc");
      return;
    }

    if (!stageForm.endedAt) {
      setError("Thời gian kết thúc là bắt buộc");
      return;
    }

    if (new Date(stageForm.startedAt) >= new Date(stageForm.endedAt)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    onSave(stageForm, stage?.id);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
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
          background: `${alpha(theme.palette.primary.main, 0.08)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {stage ? "Chỉnh sửa giai đoạn" : "Tạo giai đoạn mới"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Basic Info Section */}
            {/* Name */}
            <TextField
              label="Tên giai đoạn"
              fullWidth
              required
              value={stageForm.name}
              onChange={(e) =>
                setStageForm({ ...stageForm, name: e.target.value })
              }
              disabled={submitting}
              placeholder="Nhập tên giai đoạn"
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

          {/* Personnel Section */}
            <Autocomplete
              multiple
              fullWidth
              options={users}
              getOptionLabel={(option) => option.name || `${option.name} (${option.email})`}
              value={users.filter((u) => stageForm.userIds.includes(u.id))}
              onChange={(event, newValue) => {
                const ids = newValue.map((user) => user.id);
                setStageForm((prev) => ({ ...prev, userIds: ids }));
              }}
              disabled={submitting}
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
                      borderRadius: 2,
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Chọn người tham gia"
                    placeholder={stageForm.userIds.length === 0 ? "Tìm và chọn thành viên..." : ""}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      sx: {
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      },
                    }}
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
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={
                        option.avatar ? (
                          <Avatar src={option.avatar} />
                        ) : (
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {option.name?.[0] || 'U'}
                          </Avatar>
                        )
                      }
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                      sx={{ borderRadius: 2 }}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
                    <Avatar src={option.avatar} sx={{ width: 40, height: 40, flexShrink: 0 }}>
                      {option.name?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {option.name}
                      </Typography>
                      {option.email && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />

          {/* Time Schedule Section */}
        {/* Start time */}
          <TextField
            label="Thời gian bắt đầu"
            type="datetime-local"
            fullWidth
            required
            value={stageForm.startedAt || ""}
            onChange={(e) =>
              setStageForm({
                ...stageForm,
                startedAt: e.target.value,
              })
            }
            disabled={submitting}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
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

        {/* End time */}
          <TextField
            label="Thời gian kết thúc"
            type="datetime-local"
            fullWidth
            required
            value={stageForm.endedAt || ""}
            onChange={(e) =>
              setStageForm({ ...stageForm, endedAt: e.target.value })
            }
            disabled={submitting}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
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

                      {/* Description */}
            <TextField
              label="Mô tả"
              fullWidth
              // required
              multiline
              rows={3}
              value={stageForm.description}
              onChange={(e) =>
                setStageForm({
                  ...stageForm,
                  description: e.target.value,
                })
              }
              disabled={submitting}
              placeholder="Mô tả chi tiết về giai đoạn"
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
        </Box>
      </DialogContent>

      
      {/* Footer with Gradient */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `${alpha(theme.palette.background.paper, 0.95)}`,
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={submitting}
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
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            background: `${theme.palette.primary.main}`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            "&:hover": {
              background: `${theme.palette.primary.dark}`,
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {submitting
            ? "Đang lưu..."
            : stage
              ? "Lưu thay đổi"
              : "Tạo giai đoạn"
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StageDialog;
