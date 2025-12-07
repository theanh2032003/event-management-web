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
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StatusChip from "./StatusChip"; // Assuming StatusChip is in the same folder
import { formatDateTime } from "../../../../../utils/dateFormatter";

const TaskTable = ({ tasks, onEdit, onDelete, onRowClick, onChangeStatus, taskStates }) => {
  // console.log("🎯 TaskTable received tasks:", tasks);
  // console.log("🎯 Tasks type:", typeof tasks, "Is array:", Array.isArray(tasks));
  // console.log("🎯 Tasks length:", tasks?.length);
  
  const handleStatusChange = (event, task) => {
    event.stopPropagation(); // Prevent row click
    const newStateId = event.target.value;
    if (onChangeStatus) {
      onChangeStatus(task, newStateId);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.50" }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có công việc nào trong giai đoạn này.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: "none", 
        border: "1px solid", 
        borderColor: "divider",
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
      <Table size="small" stickyHeader>
        <TableHead sx={{ bgcolor: "grey.100" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Tên công việc</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
            {/* <TableCell sx={{ fontWeight: "bold" }}>Bắt đầu</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Kết thúc</TableCell> */}
            <TableCell sx={{ fontWeight: "bold" }}>Loại công việc</TableCell>

            <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => {
            // console.log("🔍 Rendering task:", task);
            return (
              <TableRow
                key={task.id}
                hover
                onClick={() => onRowClick(task)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {task.name}
                  </Typography>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {taskStates && taskStates.length > 0 ? (
                    <FormControl size="small" fullWidth sx={{ minWidth: 40 }}>
                      <Select
                        value={task.stateId || task.taskState?.id || ""}
                        onChange={(e) => handleStatusChange(e, task)}
                        sx={{
                          "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            py: 0.5,
                          },
                        }}
                      >
                        {taskStates.map((state) => (
                          <MenuItem key={state.id} value={state.id}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: state.color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography variant="body2">{state.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <StatusChip status={task.status || task.taskState?.name || task.state || "PENDING"} />
                  )}
                </TableCell>
                {/* <TableCell>{formatDateTime(task.startedAt)}</TableCell>
                <TableCell>{formatDateTime(task.endedAt)}</TableCell> */}
               
                <TableCell align="center">
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
