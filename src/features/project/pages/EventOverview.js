import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Paper,
  Stack,
  styled,
  alpha,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Circle as CircleIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import PermissionGate from "../../../shared/components/PermissionGate";
import { CommonDialog } from "../../../shared/components/CommonDialog";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(3),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const EventAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  alignItems: 'flex-start',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: '#f8fafc',
  border: `1px solid #e2e8f0`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  alignItems: 'flex-start',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: '#f8fafc',
  border: `1px solid #e2e8f0`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
  color: theme.palette.text.primary,
  fontSize: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ImageCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    '& img': {
      transform: 'scale(1.05)',
    },
  },
  '& img': {
    transition: 'transform 0.3s ease',
  },
}));

const BannerImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: { xs: 250, sm: 320, md: 400 },
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
}));

const BannerContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(3),
  color: 'white',
  zIndex: 2,
  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
}));

/**
 * EventOverview - Tab Tổng quan
 * Hiển thị thông tin chi tiết của event
 * Props:
 * - eventData: Dữ liệu của sự kiện
 * - onRefresh: Callback để refresh dữ liệu
 * - hasPermission: Function kiểm tra quyền (optional)
 */
export default function EventOverview({ 
  eventData, 
  onRefresh,
  hasPermission = () => true
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageCarouselPage, setImageCarouselPage] = useState(0);
  const [images, setImages] = useState(eventData.images);
  const [animating, setAnimating] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get labels
  const getCategoryLabel = (category) => {
    const labels = {
      CONFERENCE: "Hội nghị",
      SEMINAR: "Hội thảo",
      WORKSHOP: "Workshop",
      CONCERT: "Hòa nhạc",
      EXHIBITION: "Triển lãm",
      FESTIVAL: "Lễ hội",
      SPORTS: "Thể thao",
      CULTURAL: "Văn hóa",
      BUSINESS: "Kinh doanh",
      EDUCATION: "Giáo dục",
      CHARITY: "Từ thiện",
      NETWORKING: "Giao lưu",
      ENTERTAINMENT: "Giải trí",
      OTHER: "Khác"
    };
    return labels[category] || category;
  };

  const getStateLabel = (state) => {
    const labels = {
      NOT_STARTED: "Chưa bắt đầu",
      IN_PROGRESS: "Đang tiến hành",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy"
    };
    return labels[state] || state;
  };

  const getStateColor = (state) => {
    const colors = {
      NOT_STARTED: "default",
      IN_PROGRESS: "primary",
      COMPLETED: "success",
      CANCELLED: "error"
    };
    return colors[state] || "default";
  };

  const getVisibilityLabel = (visibility) => {
    return visibility === "PUBLIC" ? "Công khai" : "Riêng tư";
  };

  const getAccessTypeLabel = (accessType) => {
    return accessType === "OPEN" ? "Mở" : "Chỉ mời";
  };

  const getFeeTypeLabel = (feeType) => {
    return feeType === "FREE" ? "Miễn phí" : "Trả phí";
  };

  const theme = useTheme();

  // Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditingEvent({ ...eventData });
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    // TODO: Call API to delete event
    console.log('Delete event:', eventData.id);
    setDeleteDialogOpen(false);
  };

  const handleEditSave = () => {
    // TODO: Call API to update event
    console.log('Update event:', editingEvent);
    setEditingEvent(null);
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
  };

  const handleEditChange = (field, value) => {
    setEditingEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get number of images to display based on screen size
  const getImagesPerPage = () => {
    const width = window.innerWidth;
    // xs: < 600px = 1 image
    // sm: 600-900px = 2 images
    // md: 900-1200px = 3 images
    // lg: >= 1200px = 4 images
    if (width < 600) return 1;
    if (width < 900) return 2;
    if (width < 1200) return 3;
    return 4;
  };

  const handleNext = () => {
    if (animating) return;

    setAnimating(true);

    setTimeout(() => {
      // rotate array after animation
      setImages(prev => {
        const newArr = [...prev];
        const first = newArr.shift();
        newArr.push(first);
        return newArr;
      });
      setAnimating(false);
    }, 350); // thời gian animation
  };

  return (
    <Box>
      {/* Main Card - Banner + Description + Attributes + Gallery + Tasks */}
      <StyledCard sx={{ mb: 3, overflow: 'visible' }}>
        {/* Banner with Event Info */}
        <Box
          sx={{
            position: 'relative',
            backgroundImage: `url(${eventData.avatar || 'https://via.placeholder.com/1200x400'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: { xs: 280, sm: 350, md: 420 },
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1,
            },
          }}
        >
          {/* Menu Button */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1e293b',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleEditClick}>
                <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                Sửa
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <DeleteIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
                <Typography color="error">Xoá</Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* Banner Content */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: { xs: 2, sm: 3, md: 4 },
              color: 'white',
              zIndex: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.2rem' },
                color: '#fff',
              }}
            >
              {eventData.name}
            </Typography>

            {/* Status & Category */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={getCategoryLabel(eventData.category)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={getStateLabel(eventData.state)}
                color={getStateColor(eventData.state)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            {/* Time & Location */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
                <CalendarIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{fontSize: '0.9rem'}}>
                  {formatDate(eventData.startedAt)} - {formatDate(eventData.endedAt)}
                </Typography>
              </Box>
              {eventData.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
                  <LocationIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2" sx={{fontSize: '0.9rem'}}> 
                    {eventData.location.name}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Card Content - Description, Attributes, Gallery, Tasks */}
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Edit Form */}
          {editingEvent && (
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Chỉnh sửa
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Tên sự kiện"
                  fullWidth
                  size="small"
                  value={editingEvent?.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                />
                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={editingEvent?.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                />
                <TextField
                  label="Thời gian bắt đầu"
                  type="datetime-local"
                  fullWidth
                  size="small"
                  value={editingEvent?.startedAt || ''}
                  onChange={(e) => handleEditChange('startedAt', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Thời gian kết thúc"
                  type="datetime-local"
                  fullWidth
                  size="small"
                  value={editingEvent?.endedAt || ''}
                  onChange={(e) => handleEditChange('endedAt', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                  <Button 
                    onClick={handleEditCancel} 
                    variant="outlined"
                    sx={{
                      borderColor: '#cbd5e1',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#94a3b8',
                        backgroundColor: '#f1f5f9',
                      },
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleEditSave} 
                    variant="contained"
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      },
                    }}
                  >
                    Lưu
                  </Button>
                </Stack>
              </Stack>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* Description Section */}
          {eventData.description && !editingEvent && (
            <Box sx={{ mb: 4 }}>
              <SectionTitle sx={{ mt: 0 }}>Mô tả</SectionTitle>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: '#000000ff',
                  fontSize: '0.95rem',
                  fontWeight: 400,
                }}
              >
                {eventData.description}
              </Typography>
            </Box>
          )}

          {/* Attributes Section */}
          {!editingEvent && (
            <Box sx={{ mb: 4 }}>
              <SectionTitle>Thuộc tính</SectionTitle>
              <Stack direction="column" spacing={2}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#000000ff', fontWeight: 600, fontSize: '0.95rem', minWidth: 100 }}>
                    Hiển thị:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000ff', fontSize: '0.95rem' }}>
                    {getVisibilityLabel(eventData.visibility)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#000000ff', fontWeight: 600, fontSize: '0.95rem', minWidth: 100 }}>
                    Truy cập:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000ff', fontSize: '0.95rem' }}>
                    {getAccessTypeLabel(eventData.accessType)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#000000ff', fontWeight: 600, fontSize: '0.95rem', minWidth: 100 }}>
                    Phí tham gia:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000ff', fontSize: '0.95rem' }}>
                    {getFeeTypeLabel(eventData.feeType)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Gallery Section */}
          {eventData.images?.length > 0 && !editingEvent && (
            <Box sx={{ mb: 4 }}>
              <SectionTitle>Hình ảnh</SectionTitle>

              <style>{`
                @keyframes slideLeft {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-100%); }
                }
                @keyframes slideInRight {
                  0% { transform: translateX(120%); opacity: 0; }
                  100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutLeft {
                  0% { transform: translateX(0); opacity: 1; }
                  100% { transform: translateX(-120%); opacity: 0; }
                }
              `}</style>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                
                <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', gap: 2 }}>
                  {images.slice(0, getImagesPerPage()).map((img, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flex: `0 0 calc(${100 / getImagesPerPage()}% - 16px)`,
                        animation: animating
                          ? idx === 0
                            ? 'slideOutLeft 0.35s ease forwards'
                            : 'slideLeft 0.35s ease forwards'
                          : 'none'
                      }}
                    >
                      <ImageCard>
                        <Box
                          component="img"
                          src={img}
                          sx={{
                            width: '100%',
                            height: 240,
                            objectFit: 'cover'
                          }}
                        />
                      </ImageCard>
                    </Box>
                  ))}

                  {/* Ảnh mới xuất hiện từ bên phải */}
                  <Box
                    sx={{
                      flex: `0 0 calc(${100 / getImagesPerPage()}% - 16px)`,
                      animation: animating ? 'slideInRight 0.35s ease forwards' : 'none'
                    }}
                  >
                    <ImageCard>
                      <Box
                        component="img"
                        src={images[getImagesPerPage()]}
                        sx={{
                          width: '100%',
                          height: 240,
                          objectFit: 'cover'
                        }}
                      />
                    </ImageCard>
                  </Box>

                </Box>

                {/* nút next */}
                <IconButton
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#2563eb' },
                    flexShrink: 0,
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Task State & Type Section */}
          {(eventData.groupTaskState || eventData.groupTaskType) && !editingEvent && (
            <Box>
              <SectionTitle>Thông tin bổ sung</SectionTitle>

              {/* Group Task State */}
              {eventData.groupTaskState && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#000000ff', fontWeight: 600, fontSize: '0.95rem', minWidth: 100 }}>
                      Nhóm tiến trình:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000ff', fontSize: '0.95rem' }}>
                      {eventData.groupTaskState.name}
                    </Typography>
                  </Box>
                  {eventData.groupTaskState.states?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {eventData.groupTaskState.states.map((state) => (
                        <Chip
                          key={state.id}
                          icon={<CircleIcon sx={{ fontSize: 12 }} />}
                          label={state.name}
                          size="small"
                          sx={{
                            backgroundColor: state.color,
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {/* Group Task Type */}
              {eventData.groupTaskType && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#000000ff', fontWeight: 600, fontSize: '0.95rem', minWidth: 100 }}>
                      Nhóm công việc:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000ff', fontSize: '0.95rem' }}>
                      {eventData.groupTaskType.name}
                    </Typography>
                  </Box>
                  {eventData.groupTaskType.types?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {eventData.groupTaskType.types.map((type) => (
                        <Chip
                          key={type.id}
                          icon={<CircleIcon sx={{ fontSize: 12 }} />}
                          label={type.name}
                          size="small"
                          sx={{
                            backgroundColor: type.color,
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </StyledCard>

      {/* Delete Confirmation Dialog */}
      <CommonDialog
        open={deleteDialogOpen}
        title="Xoá sự kiện"
        submitLabel="Xoá"
        centerButtons={true}
        cancelLabel="Hủy"
        buttonStyles={{
          submit: {
            backgroundColor: '#ef4444',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#dc2626',
            },
          },
        }}
        onClose={() => setDeleteDialogOpen(false)}
        onSubmit={handleDeleteConfirm}
      >
        <Typography sx={{ textAlign: 'center' }}>
          Bạn chắc chắn muốn xoá sự kiện "{eventData.name}"? 
          Hành động này không thể hoàn tác.
        </Typography>
      </CommonDialog>
    </Box>
  );
}
