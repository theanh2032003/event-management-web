import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  TablePagination,
  Paper,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.spacing(1.5),
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const EventName = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  color: theme.palette.primary.main,
  fontWeight: 600,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.dark,
    textDecoration: 'underline',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

/**
 * EventCardList - Mobile card view cho danh sách events
 */
const EventCardList = ({
  events,
  enterpriseId,
  onEdit,
  onDelete,
  onUpdateState,
  formatDate,
  getCategoryLabel,
  getFeeTypeLabel,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const getStatusChip = (state) => {
    const statusConfig = {
      NOT_STARTED: { label: "Chưa bắt đầu", color: "default" },
      IN_PROGRESS: { label: "Đang diễn ra", color: "primary" },
      COMPLETED: { label: "Hoàn thành", color: "success" },
      CANCELED: { label: "Đã hủy", color: "error" },
    };
    const config = statusConfig[state] || statusConfig.NOT_STARTED;
    return <Chip label={config.label} size="small" color={config.color} />;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid item xs={12} key={event.id}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  {event.avatar ? (
                    <StyledAvatar src={event.avatar} variant="rounded" />
                  ) : (
                    <StyledAvatar variant="rounded" sx={{ bgcolor: 'primary.main' }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {event.name?.charAt(0)?.toUpperCase()}
                      </Typography>
                    </StyledAvatar>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <EventName 
                      variant="h6" 
                      gutterBottom
                      onClick={() => navigate(`/enterprise/${enterpriseId}/event-management/${event.id}`)}
                    >
                      {event.name}
                    </EventName>
                    <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                      <Chip 
                        label={getCategoryLabel(event.category)} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={getFeeTypeLabel(event.feeType)}
                        size="small"
                        color={event.feeType === "FREE" ? "success" : "warning"}
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Thời gian */}
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1, 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(event.startedAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đến {formatDate(event.endedAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Trạng thái với dropdown */}
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={event.state || "NOT_STARTED"}
                      onChange={(e) => onUpdateState(event.id, e.target.value)}
                      renderValue={(value) => getStatusChip(value)}
                      sx={{
                        borderRadius: 1.5,
                        '& .MuiSelect-select': {
                          py: 1,
                        },
                      }}
                    >
                      <MenuItem value="NOT_STARTED">
                        <Chip label="Chưa bắt đầu" size="small" color="default" />
                      </MenuItem>
                      <MenuItem value="IN_PROGRESS">
                        <Chip label="Đang diễn ra" size="small" color="primary" />
                      </MenuItem>
                      <MenuItem value="COMPLETED">
                        <Chip label="Hoàn thành" size="small" color="success" />
                      </MenuItem>
                      <MenuItem value="CANCELED">
                        <Chip label="Đã hủy" size="small" color="error" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Actions */}
                <Box 
                  sx={{ 
                    display: "flex", 
                    justifyContent: "flex-end", 
                    gap: 1,
                    pt: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Tooltip title="Xem chi tiết">
                    <ActionButton 
                      size="small" 
                      onClick={() => navigate(`/enterprise/${enterpriseId}/event-management/${event.id}`)}
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <ActionButton 
                      size="small" 
                      onClick={() => onEdit(event)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <ActionButton
                      size="small"
                      onClick={() => onDelete(event.id)}
                      sx={(theme) => ({
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        },
                      })}
                    >
                      <DeleteIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ mt: 3, borderRadius: 2 }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Số sự kiện mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};

export default EventCardList;
