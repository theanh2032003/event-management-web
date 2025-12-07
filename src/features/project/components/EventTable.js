import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  Tooltip,
  styled,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 300px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '4px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
  '& .MuiTableHead-root': {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      fontWeight: 700,
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
      padding: theme.spacing(2),
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateY(-1px)',
        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
      '&:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(2),
    },
  },
}));

const EventNameBox = styled(Box)(({ theme }) => ({
  '& .event-name': {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.primary.dark,
      textDecoration: 'underline',
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1),
  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const StatusSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 140,
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiSelect-select': {
    padding: theme.spacing(0.5, 1),
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
}));

/**
 * EventTable - Desktop table view cho danh sách events
 */
const EventTable = ({
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
    <StyledTableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="60px"></TableCell>
            <TableCell>Tên sự kiện</TableCell>
            <TableCell width="150px">Loại sự kiện</TableCell>
            <TableCell width="120px">Loại phí</TableCell>
            <TableCell width="200px">Thời gian</TableCell>
            <TableCell width="160px">Trạng thái</TableCell>
            <TableCell align="center" width="120px">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} hover>
              <TableCell>
                {event.avatar ? (
                  <StyledAvatar src={event.avatar} variant="rounded" />
                ) : (
                  <StyledAvatar variant="rounded" sx={{ bgcolor: 'primary.main' }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      {event.name?.charAt(0)?.toUpperCase()}
                    </Typography>
                  </StyledAvatar>
                )}
              </TableCell>
              <TableCell>
                <EventNameBox>
                  <Typography 
                    variant="body1"
                    className="event-name"
                    onClick={() => navigate(`/enterprise/${enterpriseId}/event-management/${event.id}`)}
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {event.name}
                  </Typography>
                </EventNameBox>
              </TableCell>
              <TableCell>
                <Chip 
                  label={getCategoryLabel(event.category)} 
                  size="small"
                  sx={{
                    fontWeight: 500,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={getFeeTypeLabel(event.feeType)}
                  size="small"
                  color={event.feeType === "FREE" ? "success" : "warning"}
                  sx={{
                    fontWeight: 500,
                  }}
                />
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Bắt đầu: {formatDate(event.startedAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kết thúc: {formatDate(event.endedAt)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <StatusSelect size="small">
                  <Select
                    value={event.state || "NOT_STARTED"}
                    onChange={(e) => onUpdateState(event.id, e.target.value)}
                    renderValue={(value) => getStatusChip(value)}
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
                </StatusSelect>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
        sx={(theme) => ({
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        })}
      />
    </StyledTableContainer>
  );
};

export default EventTable;
