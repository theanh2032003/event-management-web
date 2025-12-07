import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  CalendarMonth as CalendarIcon,
  Schedule as TimeIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { formatChildScheduleTime } from "../../../shared/utils/dateFormatter";

// Styled Components
const SubScheduleContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.04)}, inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.02)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}, inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.04)}`,
  },
}));

const SubScheduleHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const SubScheduleTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledAddButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  fontSize: '0.875rem',
  boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
  maxHeight: 'calc(100vh - 500px)',
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
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
    transform: 'translateX(2px)',
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
    padding: theme.spacing(1.5),
  },
}));

/**
 * ChildScheduleTable - Table for child schedules with compact styling and smart date formatting
 * @param {array} childSchedules - Array of child schedules
 * @param {function} onEdit - Edit child handler
 * @param {function} onDelete - Delete child handler
 * @param {function} onAddChild - Add child handler
 * @param {function} onViewDetail - View detail handler
 * @param {function} formatDate - Date formatting function (not used, using formatChildScheduleTime instead)
 * @param {object} parentSchedule - Parent schedule object
 */
const ChildScheduleTable = ({
  childSchedules,
  onEdit,
  onDelete,
  onAddChild,
  onViewDetail,
  formatDate, // Kept for compatibility but not used
  parentSchedule,
}) => {
  const theme = useTheme();

  return (
    <SubScheduleContainer>
      <SubScheduleHeader>
        <SubScheduleTitle variant="subtitle2">
          Lịch trình con ({childSchedules.length})
        </SubScheduleTitle>
        <StyledAddButton
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddChild}
        >
          Thêm lịch trình con
        </StyledAddButton>
      </SubScheduleHeader>

      {childSchedules.length === 0 ? (
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: "center", 
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.spacing(1),
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chưa có lịch trình con — hãy tạo mới.
          </Typography>
          {/* <StyledAddButton
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddChild}
          >
            Thêm lịch trình con
          </StyledAddButton> */}
        </Paper>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table size="small">
            <StyledTableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}></TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Bắt đầu</TableCell>
                <TableCell>Kết thúc</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {childSchedules.map((child) => (
                <StyledTableRow 
                  key={child.id}
                >
                  {/* Image */}
                  <TableCell sx={{ width: 80 }}>
                    {child.images && child.images.length > 0 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Avatar
                          src={child.images[0]}
                          variant="rounded"
                          sx={{ 
                            width: 48, 
                            height: 48,
                            boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                          }}
                        >
                          <ImageIcon fontSize="small" />
                        </Avatar>
                        {child.images.length > 1 && (
                          <Chip
                            label={`+${child.images.length - 1}`}
                            size="small"
                            sx={{ 
                              fontSize: "0.65rem", 
                              height: 18,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Avatar 
                        variant="rounded" 
                        sx={{ 
                          width: 48, 
                          height: 48,
                          backgroundColor: alpha(theme.palette.action.hover, 0.5),
                          boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                        }}
                      >
                        <ImageIcon fontSize="small" />
                      </Avatar>
                    )}
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {child.title}
                    </Typography>
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.5,
                      }}
                    >
                      {child.description || "Không có mô tả"}
                    </Typography>
                  </TableCell>

                  {/* Start Time - Smart format based on parent date */}
                  <TableCell>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 0.75,
                      padding: theme.spacing(0.5, 1),
                      borderRadius: theme.spacing(0.5),
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }}>
                      <CalendarIcon 
                        fontSize="small" 
                        sx={{ 
                          fontSize: 16,
                          color: theme.palette.primary.main,
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        color="text.primary"
                      >
                        {formatChildScheduleTime(
                          child.startedAt,
                          parentSchedule.startedAt,
                          parentSchedule.endedAt
                        )}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* End Time - Smart format based on parent date */}
                  <TableCell>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 0.75,
                      padding: theme.spacing(0.5, 1),
                      borderRadius: theme.spacing(0.5),
                      backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                    }}>
                      <TimeIcon 
                        fontSize="small" 
                        sx={{ 
                          fontSize: 16,
                          color: theme.palette.secondary.main,
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        color="text.primary"
                      >
                        {formatChildScheduleTime(
                          child.endedAt,
                          parentSchedule.startedAt,
                          parentSchedule.endedAt
                        )}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        onClick={() => onViewDetail(child)}
                        title="Xem chi tiết"
                        sx={{
                          color: theme.palette.info.main,
                          backgroundColor: alpha(theme.palette.info.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.15),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(child)}
                        title="Chỉnh sửa"
                        sx={{
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(child)}
                        title="Xóa"
                        sx={{
                          color: theme.palette.error.main,
                          backgroundColor: alpha(theme.palette.error.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.15),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </SubScheduleContainer>
  );
};

export default ChildScheduleTable;
