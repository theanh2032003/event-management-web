import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  Box,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Collapse,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CalendarMonth as CalendarIcon,
  Schedule as TimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import ChildScheduleTable from "./ChildScheduleTable";

// Styled Components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  },
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    transform: 'scale(1.1)',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

/**
 * ScheduleRow - Single row for parent schedule with expandable child schedules
 * @param {object} schedule - Parent schedule object
 * @param {array} childSchedules - Array of child schedules
 * @param {function} onEdit - Edit parent handler
 * @param {function} onDelete - Delete parent handler
 * @param {function} onEditChild - Edit child handler
 * @param {function} onDeleteChild - Delete child handler
 * @param {function} onAddChild - Add child handler
 * @param {function} onViewDetail - View detail handler
 * @param {function} formatDate - Date formatting function
 */
const ScheduleRow = ({
  schedule,
  childSchedules,
  onEdit,
  onDelete,
  onEditChild,
  onDeleteChild,
  onAddChild,
  onViewDetail,
  formatDate,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      {/* Parent Schedule Row */}
      <StyledTableRow hover>
        {/* Expand Toggle - Always visible */}
        <TableCell sx={{ width: 50 }}>
          <ExpandButton
            size="small"
            onClick={handleToggleExpand}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ExpandButton>
        </TableCell>

        {/* Image */}
        <TableCell>
          {schedule.images && schedule.images.length > 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={schedule.images[0]}
                variant="rounded"
                sx={{ 
                  width: 64, 
                  height: 64,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
              >
                <ImageIcon />
              </Avatar>
              {schedule.images.length > 1 && (
                <Chip
                  label={`+${schedule.images.length - 1}`}
                  size="small"
                  sx={{ 
                    fontSize: "0.7rem",
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
                width: 64, 
                height: 64,
                backgroundColor: alpha(theme.palette.action.hover, 0.5),
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
              }}
            >
              <ImageIcon />
            </Avatar>
          )}
        </TableCell>

        {/* Title with child count */}
        <TableCell>
          <Box>
            <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
              {schedule.title}
            </Typography>
            {childSchedules.length > 0 && (
              <Chip
                label={`${childSchedules.length} lịch trình con`}
                size="small"
                sx={{ 
                  mt: 0.5, 
                  fontSize: "0.75rem",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
            )}
          </Box>
        </TableCell>

        {/* Description */}
        <TableCell>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 300,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.6,
            }}
          >
            {schedule.description || "Không có mô tả"}
          </Typography>
        </TableCell>

        {/* Start Time */}
        <TableCell>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            padding: theme.spacing(0.75, 1.5),
            borderRadius: theme.spacing(1),
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            width: 'fit-content',
          }}>
            <CalendarIcon 
              fontSize="small" 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: 18,
              }} 
            />
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {formatDate(schedule.startedAt)}
            </Typography>
          </Box>
        </TableCell>

        {/* End Time */}
        <TableCell>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            padding: theme.spacing(0.75, 1.5),
            borderRadius: theme.spacing(1),
            backgroundColor: alpha(theme.palette.secondary.main, 0.06),
            width: 'fit-content',
          }}>
            <TimeIcon 
              fontSize="small" 
              sx={{ 
                color: theme.palette.secondary.main,
                fontSize: 18,
              }} 
            />
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {formatDate(schedule.endedAt)}
            </Typography>
          </Box>
        </TableCell>

        {/* Actions */}
        <TableCell align="center">
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
            <ActionButton
              size="small"
              onClick={() => onViewDetail(schedule)}
              title="Xem chi tiết"
              sx={{
                color: theme.palette.info.main,
                backgroundColor: alpha(theme.palette.info.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </ActionButton>
            <ActionButton
              size="small"
              onClick={() => onEdit(schedule)}
              title="Chỉnh sửa"
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </ActionButton>
            <ActionButton
              size="small"
              onClick={() => onDelete(schedule)}
              title="Xóa"
              sx={{
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.15),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </ActionButton>
          </Box>
        </TableCell>
      </StyledTableRow>

      {/* Child Schedules (Collapsible) - Always rendered */}
      <TableRow>
        <TableCell 
          colSpan={7} 
          sx={{ 
            p: 0, 
            border: 0,
            backgroundColor: 'transparent',
          }}
        >
          <Collapse in={expanded} timeout={400} unmountOnExit>
            <Box sx={{ py: 1 }}>
              <ChildScheduleTable
                childSchedules={childSchedules}
                onEdit={onEditChild}
                onDelete={onDeleteChild}
                onAddChild={() => onAddChild(schedule)}
                onViewDetail={onViewDetail}
                formatDate={formatDate}
                parentSchedule={schedule}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ScheduleRow;
