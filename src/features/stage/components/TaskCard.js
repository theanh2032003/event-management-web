import React from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDateTime } from "../../../shared/utils/dateFormatter";

/**
 * TaskCard - Draggable task card component for Kanban board
 * @param {object} task - Task data
 * @param {function} onClick - Click handler to view task details
 * @param {function} onEdit - Click handler to edit task
 * @param {function} onDelete - Click handler to delete task
 */
const TaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent card click
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    onDelete(task);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        bgcolor: "white",
        boxShadow: 2,
        borderRadius: 2,
        transition: "all 0.2s ease",
        position: "relative",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
        "&:hover .action-buttons": {
          opacity: 1,
        },
      }}
    >
      <CardContent 
        sx={{ p: 2, "&:last-child": { pb: 2 } }}
        {...attributes}
        {...listeners}
        onClick={() => onClick(task)}
      >
        {/* Action Buttons */}
        <Box
          className="action-buttons"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 0.5,
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <IconButton
            size="small"
            onClick={handleEdit}
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": {
                bgcolor: "primary.light",
                color: "white",
              },
              width: 28,
              height: 28,
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": {
                bgcolor: "error.main",
                color: "white",
              },
              width: 28,
              height: 28,
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Task Name */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pr: 7, // Add padding right to avoid overlap with buttons
          }}
        >
          {task.name}
        </Typography>

        {/* Task Type */}
        {task.taskType && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: task.taskType.color || "#gray",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: task.taskType.color || "#666",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            >
              {task.taskType.name}
            </Typography>
          </Box>
        )}

        {/* End Date */}
        {task.endedAt && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.7rem",
            }}
          >
            📅 {formatDateTime(task.endedAt)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
