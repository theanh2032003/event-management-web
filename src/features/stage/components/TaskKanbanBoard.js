import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

/**
 * DroppableColumn - Droppable wrapper for each column
 */
const DroppableColumn = ({ id, children }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <Box ref={setNodeRef} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {children}
    </Box>
  );
};

/**
 * TaskKanbanBoard - Kanban board layout for tasks
 * @param {array} tasks - Array of tasks
 * @param {array} taskStates - Array of task states (columns)
 * @param {function} onTaskClick - Handler for task card click
 * @param {function} onTaskEdit - Handler for task edit
 * @param {function} onTaskDelete - Handler for task delete
 * @param {function} onTaskStateChange - Handler for task state change (drag & drop)
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 */
const TaskKanbanBoard = ({
  tasks,
  taskStates,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskStateChange,
  loading,
  error,
}) => {
  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag (better for click vs drag)
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const task = tasks.find((t) => t.id === active.id);
    
    if (!task) {
      setActiveId(null);
      return;
    }

    console.log("🎯 Drag & Drop Event:", {
      activeId: active.id,
      overId: over.id,
      task: task,
      currentStateId: task.stateId
    });

    // Find which state the task was dropped into
    let newStateId = null;
    
    // Check if dropped directly on another task
    const droppedOnTask = tasks.find((t) => t.id === over.id);
    if (droppedOnTask) {
      // Dropped on another task - use that task's state
      newStateId = droppedOnTask.stateId;
      console.log("📌 Dropped on task:", droppedOnTask.name, "State:", newStateId);
    } else {
      // Dropped on empty area - over.id should be state.id
      newStateId = over.id;
      console.log("📌 Dropped on empty column, State:", newStateId);
    }

    console.log("🔄 State change:", {
      from: task.stateId,
      to: newStateId,
      willUpdate: task.stateId !== newStateId
    });

    // Only update if state actually changed
    if (task && newStateId && task.stateId !== newStateId) {
      onTaskStateChange(task, newStateId);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Group tasks by state
  const tasksByState = React.useMemo(() => {
    const grouped = {};
    taskStates.forEach((state) => {
      grouped[state.id] = tasks.filter((task) => task.stateId === state.id);
    });
    return grouped;
  }, [tasks, taskStates]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (taskStates.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Chưa có trạng thái công việc. Vui lòng cấu hình trạng thái cho dự án.
      </Alert>
    );
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 2,
        //   minHeight: 400,
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: 4,
            "&:hover": {
              background: "rgba(0, 0, 0, 0.3)",
            },
          },
        }}
      >
        {taskStates.map((state) => (
          <Box
            key={state.id}
            sx={{
              minWidth: { xs: 280, sm: 300, md: 320 },
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Column Header */}
            <Paper
              sx={{
                p: 2,
                mb: 2,
                bgcolor: state.color || "#e0e0e0",
                color: "white",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  {state.name}
                </Typography>
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.3)",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  >
                    {tasksByState[state.id]?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Column Content - Droppable Area */}
            <DroppableColumn id={state.id}>
              <SortableContext
                id={state.id}
                items={tasksByState[state.id]?.map((t) => t.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <Box
                  sx={{
                    flex: 1,
                  //   minHeight: 200,
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  {tasksByState[state.id]?.length > 0 ? (
                    tasksByState[state.id].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={onTaskClick}
                        onEdit={onTaskEdit}
                        onDelete={onTaskDelete}
                      />
                    ))
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      //   height: 100,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      Chưa có công việc
                    </Box>
                  )}
                </Box>
              </SortableContext>
            </DroppableColumn>
          </Box>
        ))}
      </Box>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <Box sx={{ transform: "rotate(5deg)", cursor: "grabbing" }}>
            <TaskCard 
              task={activeTask} 
              onClick={() => {}} 
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskKanbanBoard;
