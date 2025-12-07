import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import StageRow from "./StageRow";

/**
 * StageTable - Table displaying list of stages
 * @param {array} stages - Array of stages
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 * @param {function} onChangeStatus - Change status handler
 * @param {number} projectId - Project ID for fetching task types and states
 * @param {string} enterpriseId - Enterprise ID for API calls
 * @param {array} taskStates - Array of task states for task status dropdown
 * @param {array} taskTypes - Array of task types for task type dropdown
 */
const StageTable = ({ stages, onEdit, onDelete, onChangeStatus, projectId, enterpriseId, taskStates, taskTypes }) => {
  if (stages.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có giai đoạn nào. Nhấn "Thêm giai đoạn" để tạo mới.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: 2,
        maxHeight: 'calc(100vh - 400px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}
    >
      <Table >
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.100" }}>
            <TableCell sx={{ width: 50 }}></TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Giai đoạn</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 180 }}>Trạng thái</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 180 }}>Bắt đầu</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 180 }}>Kết thúc</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stages.map((stage) => (
            <StageRow
              key={stage.id}
              stage={stage}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangeStatus={onChangeStatus}
              projectId={projectId}
              enterpriseId={enterpriseId}
              taskStates={taskStates}
              taskTypes={taskTypes}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StageTable;
