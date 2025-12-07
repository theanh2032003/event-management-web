import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Divider,
  styled,
  alpha,
  Badge,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Label as LabelIcon,
  Notes as NotesIcon,
  People as PeopleIcon,
  Image as ImageIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
} from "@mui/icons-material";
import { formatDateTime } from "../../../shared/utils/dateFormatter";
import StatusChip from "./StatusChip";
import commentApi from "../../comment/api/comment.api";
import stageApi from "../api/stage.api";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: `${theme.spacing(2)} !important`,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  marginBottom: theme.spacing(2),
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: `0 0 ${theme.spacing(2)}px 0`,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const PersonnelCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-2px)",
  },
}));

const ImageThumbnail = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to get avatar color based on name
const getAvatarColor = (name) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B195", "#C06C84",
  ];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const TaskDetailDialog = ({ open, onClose, task, projectId, stageId, enterpriseId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  
  // Comment state
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Image preview state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  // Fetch comments and users when dialog opens
  useEffect(() => {
    if (open && task?.id) {
      fetchComments();
      fetchTaskUsers();
    }
  }, [open, task?.id, projectId, stageId]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      console.log("🔍 Fetching comments for task:", task.id, "enterpriseId:", enterpriseId);
      const data = await commentApi.getAll(task.id, enterpriseId);
      console.log("📥 Received comments:", {
        data: data,
        commentsCount: data?.length || 0,
        firstComment: data?.[0]
      });
      setComments(data || []);
    
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchTaskUsers = async () => {
    if (!projectId || !stageId) return;
    
    try {
      const response = await stageApi.getUsers(projectId, stageId);
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching stage users:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      const commentData = {
        content: commentContent,
        taggedUserIds: taggedUsers.map(u => u.id),
        files: [],
        ...(replyTo && { parentId: replyTo.id })
      };

      await commentApi.create(task.id, commentData, enterpriseId);
      
      // Reset form
      setCommentContent("");
      setTaggedUsers([]);
      setReplyTo(null);
      
      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
    setSelectedImage(null);
  };

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    personnel: true,
    status: true,
    attachments: true,
  });

  if (!task) return null;

  // Combine all personnel with their roles
  const allPersonnel = [
    ...(task.implementers || []).map((p) => ({ 
      ...p, 
      role: "implementer", 
      roleLabel: "Thực hiện",
      roleColor: "primary",
    })),
    ...(task.supporters || []).map((p) => ({ 
      ...p, 
      role: "supporter", 
      roleLabel: "Hỗ trợ",
      roleColor: "info",
    })),
    ...(task.testers || []).map((p) => ({ 
      ...p, 
      role: "tester", 
      roleLabel: "Kiểm tra",
      roleColor: "warning",
    })),
  ];

  const handleSectionToggle = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      fullWidth 
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          height: "90vh",
          width: "90%",
          maxWidth: "90%",
          m: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AssignmentIcon color="primary" />
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {task.name}
              </Typography>
            </Box>
            
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              "&:hover": {
                bgcolor: alpha(theme.palette.grey[500], 0.2),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent 
        sx={{ 
          p: isMobile ? 2 : 3,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          overflow: "auto",
        }}
      >
        <Box sx={{ 
          maxWidth: "100%", 
          mx: "auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 2fr",
          gap: 2,
        }}>
          {/* Left Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Description Section */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <SectionTitle sx={{ mb: 2 }}>
                <NotesIcon color="primary" />
                Mô tả công việc
              </SectionTitle>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {task.description || "Không có mô tả chi tiết."}
              </Typography>
            </Paper>

            {/* Status & Timeline Section */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              {/* <SectionTitle sx={{ mb: 2 }}>
                <ScheduleIcon color="primary" />
                Trạng thái & Phân loại
              </SectionTitle> */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                {/* Task Type */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CategoryIcon sx={{ fontSize: 16, color: task.taskType?.color || theme.palette.secondary.main }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Phân loại
                    </Typography>
                  </Box>
                  <Chip
                    label={task.taskType?.name || "N/A"}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderColor: task.taskType?.color || theme.palette.secondary.main,
                      color: task.taskType?.color || theme.palette.secondary.main,
                      bgcolor: task.taskType?.color ? alpha(task.taskType.color, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                      border: `1px solid ${task.taskType?.color || theme.palette.secondary.main}`,
                    }}
                  />
                </Box>

                {/* Task State */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: task.taskState?.color || theme.palette.grey[500] }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Trạng thái
                    </Typography>
                  </Box>
                  <Chip
                    label={task.taskState?.name || "N/A"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: task.taskState?.color || theme.palette.grey[500],
                      color: "#fff",
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Attachments Section */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <SectionTitle>
                  <ImageIcon color="primary" />
                  Hình ảnh
                </SectionTitle>
                <Badge badgeContent={task.images?.length || 0} color="primary">
                  <Box />
                </Badge>
              </Box>
              {task.images && task.images.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isMobile 
                      ? "repeat(auto-fill, minmax(80px, 1fr))"
                      : "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 2,
                  }}
                >
                  {task.images.map((img, index) => (
                    <Tooltip key={index} title="Click để xem ảnh lớn">
                      <ImageThumbnail
                        src={img}
                        variant="rounded"
                        onClick={() => handleImageClick(img)}
                      >
                        <ImageIcon />
                      </ImageThumbnail>
                    </Tooltip>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                    borderRadius: 2,
                    border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Không có hình ảnh đính kèm
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Middle Column - Personnel */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <SectionTitle>
                  <PeopleIcon color="primary" />
                  Nhân sự tham gia
                </SectionTitle>
                <Badge badgeContent={allPersonnel.length} color="primary">
                  <Box />
                </Badge>
              </Box>
              <Stack spacing={1.5}>
                  {allPersonnel.length > 0 ? (
                    allPersonnel.map((person, index) => (
                      <PersonnelCard key={person.id || index} elevation={0}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                          {/* Avatar */}
                          <Avatar
                            src={person.avatar || ""}
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: person.avatar ? "transparent" : getAvatarColor(person.name),
                              fontWeight: 500,
                              fontSize: "1.2rem",
                              border: `3px solid ${alpha(getAvatarColor(person.name), 0.2)}`,
                            }}
                          >
                            {!person.avatar && getInitials(person.name)}
                          </Avatar>

                          {/* Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={400} noWrap fontSize={12}>
                              {person.name}
                            </Typography>
                            {/* <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {person.email}
                            </Typography> */}
                            {/* {person.phone && (
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 0.25,
                                }}
                              >
                                📞 {person.phone}
                              </Typography>
                            )} */}
                          </Box>

                          {/* Role Display */}
                          <Chip
                            label={person.roleLabel}
                            size="small"
                            color={person.roleColor}
                            sx={{ 
                              fontWeight: 600,
                              minWidth: 100,
                            }}
                          />
                        </Box>
                      </PersonnelCard>
                    ))
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: alpha(theme.palette.action.hover, 0.3),
                        borderRadius: 2,
                        border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        Chưa có nhân sự nào được gán
                      </Typography>
                    </Paper>
                  )}
                </Stack>
            </Paper>
          </Box>

          {/* Right Column - Comments (wider) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Comments Section */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, display: "flex", flexDirection: "column", minHeight: 400 }}>
              <SectionTitle sx={{ mb: 2 }}>
                <ChatIcon color="primary" />
                Trao đổi công việc
                <Badge badgeContent={comments.length} color="primary" sx={{ ml: 1 }}>
                  <Box />
                </Badge>
              </SectionTitle>
              
              {/* Comments List */}
              <Box sx={{ flex: 1, mb: 2, overflow: "auto", maxHeight: 400 }}>
                {loadingComments ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : comments.length > 0 ? (
                  <Stack spacing={2}>
                    {comments.map((comment) => (
                      <Paper
                        key={comment.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          borderRadius: 2,
                          ...(comment.parentId && { ml: 4, borderLeft: `3px solid ${theme.palette.primary.main}` })
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <Avatar
                            src={comment.sender?.avatar || ""}
                            sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: comment.sender?.avatar ? "transparent" : getAvatarColor(comment.sender?.name),
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              border: `2px solid ${alpha(getAvatarColor(comment.sender?.name), 0.2)}`,
                            }}
                          >
                            {!comment.sender?.avatar && getInitials(comment.sender?.name)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {comment.sender?.name || "Unknown User"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(comment.createdAt)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
                              {comment.content}
                            </Typography>
                            {comment.taggedUsers && comment.taggedUsers.length > 0 && (
                              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                                {comment.taggedUsers.map((user) => (
                                  <Chip
                                    key={user.id}
                                    label={`@${user.name}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                  />
                                ))}
                              </Box>
                            )}
                            {comment.children && comment.children.length > 0 && (
                              <Box sx={{ mt: 2, ml: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Stack spacing={1.5}>
                                  {comment.children.map((reply) => (
                                    <Box key={reply.id} sx={{ display: "flex", gap: 1 }}>
                                      <Avatar 
                                        src={reply.sender?.avatar || ""} 
                                        sx={{ 
                                          width: 24, 
                                          height: 24,
                                          bgcolor: reply.sender?.avatar ? "transparent" : getAvatarColor(reply.sender?.name),
                                          fontWeight: 600,
                                          fontSize: "0.7rem",
                                          border: `2px solid ${alpha(getAvatarColor(reply.sender?.name), 0.2)}`,
                                        }}
                                      >
                                        {!reply.sender?.avatar && getInitials(reply.sender?.name)}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                          <Typography variant="caption" fontWeight={600}>
                                            {reply.sender?.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {formatDateTime(reply.createdAt)}
                                          </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                          {reply.content}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ))}
                                </Stack>
                              </Box>
                            )}
                            <Button
                              size="small"
                              startIcon={<ReplyIcon />}
                              onClick={() => handleReply(comment)}
                              sx={{ textTransform: "none", fontSize: "0.75rem", mt: 1 }}
                            >
                              Trả lời
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    Chưa có trao đổi nào
                  </Typography>
                )}
              </Box>

              {/* Reply indicator */}
              {replyTo && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    mb: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    borderLeft: `3px solid ${theme.palette.info.main}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ReplyIcon fontSize="small" color="info" />
                    <Typography variant="caption" color="text.secondary">
                      Đang trả lời: <strong>{replyTo.sender?.name}</strong>
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={cancelReply}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Paper>
              )}

              {/* Comment Input */}
              <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
                {/* Tag Users Autocomplete */}
                <Autocomplete
                  multiple
                  size="small"
                  options={availableUsers}
                  getOptionLabel={(option) => option.name}
                  value={taggedUsers}
                  onChange={(event, newValue) => setTaggedUsers(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tag người dùng..."
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`@${option.name}`}
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                  sx={{ mb: 1 }}
                />

                {/* Comment Text Input */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={4}
                    placeholder="Nhập nội dung trao đổi..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    variant="outlined"
                    size="small"
                  />
               <IconButton
                onClick={handleSubmitComment}
                disabled={!commentContent.trim() || submittingComment}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  width: 46,
                  height: 46,
                  boxShadow: "0px 3px 6px rgba(0,0,0,0.2)",
                  transition: "0.3s",
                  "&:hover": { 
                    bgcolor: theme.palette.primary.dark,
                    transform: "scale(1.08)",
                    boxShadow: "0px 5px 12px rgba(0,0,0,0.25)",
                  },
                  "&.Mui-disabled": { 
                    bgcolor: alpha(theme.palette.primary.main, 0.3),
                    color: "#fff",
                    boxShadow: "none",
                    transform: "none"
                  }
                }}
              >
                {submittingComment 
                  ? <CircularProgress size={20} color="inherit" /> 
                  : <SendIcon /> }
              </IconButton>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Button 
          onClick={handleEdit}
          variant="contained"
          size="large"
          sx={{
            minWidth: 120,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Sửa công việc
        </Button>
      </DialogActions>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: alpha("#000", 0.9),
            position: "relative",
            minHeight: "80vh",
          }}
        >
          <IconButton
            onClick={handleCloseImagePreview}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              bgcolor: alpha("#000", 0.5),
              "&:hover": {
                bgcolor: alpha("#000", 0.7),
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default TaskDetailDialog;
