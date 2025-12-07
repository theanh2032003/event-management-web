import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  alpha,
} from "@mui/material";
import ScheduleRow from "./ScheduleRow";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
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
      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(2),
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
      },
      '& .MuiTableCell-root': {
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        padding: theme.spacing(2),
      },
    },
  },
}));

/**
 * ScheduleTable - Main table displaying parent schedules with expandable children
 * @param {array} schedules - Array of parent schedules (API returns nested structure with children array)
 * @param {function} onEdit - Edit parent handler
 * @param {function} onDelete - Delete parent handler
 * @param {function} onEditChild - Edit child handler
 * @param {function} onDeleteChild - Delete child handler
 * @param {function} onAddChild - Add child handler
 * @param {function} onViewDetail - View detail handler
 * @param {function} formatDate - Date formatting function
 */
const ScheduleTable = ({
  schedules,
  onEdit,
  onDelete,
  onEditChild,
  onDeleteChild,
  onAddChild,
  onViewDetail,
  formatDate,
}) => {
  // Filter only parent schedules (parentId = null)
  // API already returns nested structure with children array in each parent
  const parentSchedules = schedules.filter(s => s.parentId == null);

 

  return (
    <StyledTableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50 }}></TableCell>
            <TableCell>Hình ảnh</TableCell>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Thời gian bắt đầu</TableCell>
            <TableCell>Thời gian kết thúc</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parentSchedules.map((schedule) => (
            <ScheduleRow
              key={schedule.id}
              schedule={schedule}
              childSchedules={schedule.children || []}
              onEdit={onEdit}
              onDelete={onDelete}
              onEditChild={onEditChild}
              onDeleteChild={onDeleteChild}
              onAddChild={onAddChild}
              onViewDetail={onViewDetail}
              formatDate={formatDate}
            />
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default ScheduleTable;
