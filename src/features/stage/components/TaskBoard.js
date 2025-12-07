import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import taskApi from "../api/task.api";

export default function TaskBoard({ selectedStage, onBackToStages }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [columns, setColumns] = useState([
    { key: "todo", title: "To do", tasks: [] },
    { key: "inprogress", title: "In progress", tasks: [] },
    { key: "review", title: "Review", tasks: [] },
    { key: "done", title: "Done", tasks: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentForm, setCurrentForm] = useState({ column: null, title: "", assignee: "", deadline: "" });
  const [editing, setEditing] = useState({ column: null, taskId: null });
  const [editForm, setEditForm] = useState({ title: "", assignee: "", deadline: "" });

  // Fetch tasks from API when stage is selected
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getTasksByStage(selectedStage.id);
        const tasksData = response?.data?.data || response?.data || response;
        
        if (Array.isArray(tasksData)) {
          // Group tasks by status
          const grouped = {
            todo: tasksData.filter(t => t.status === 'todo'),
            inprogress: tasksData.filter(t => t.status === 'inprogress'),
            review: tasksData.filter(t => t.status === 'review'),
            done: tasksData.filter(t => t.status === 'done'),
          };
          
          setColumns(columns.map(col => ({ ...col, tasks: grouped[col.key] || [] })));
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.response?.data?.message || 'Không thể tải công việc');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStage) {
      fetchTasks();
    }
  }, [selectedStage]);

  function openAddForm(colKey) {
    setCurrentForm({ column: colKey, title: "", assignee: "", deadline: "" });
    // close edit if open
    setEditing({ column: null, taskId: null });
  }

  function closeForm() {
    setCurrentForm({ column: null, title: "", assignee: "", deadline: "" });
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    setCurrentForm((f) => ({ ...f, [name]: value }));
  }

  function handleAddTask(e) {
    e.preventDefault();
    if (!currentForm.column || !currentForm.title) return;

    const newTask = {
      id: `t${Date.now()}`,
      title: currentForm.title,
      assignee: currentForm.assignee || "-",
      deadline: currentForm.deadline || "-",
      status: currentForm.column,
    };

    setColumns((cols) =>
      cols.map((c) => (c.key === currentForm.column ? { ...c, tasks: [newTask, ...c.tasks] } : c))
    );

    closeForm();
  }

  // edit handlers
  function openEditForm(colKey, task) {
    setEditing({ column: colKey, taskId: task.id });
    setEditForm({ title: task.title, assignee: task.assignee, deadline: task.deadline });
    // close add form if open
    setCurrentForm({ column: null, title: "", assignee: "", deadline: "" });
  }

  function onEditChange(e) {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  }

  function saveEdit(e) {
    e.preventDefault();
    const { column, taskId } = editing;
    if (!column || !taskId) return;

    setColumns((cols) =>
      cols.map((c) =>
        c.key === column
          ? { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, ...editForm } : t)) }
          : c
      )
    );

    setEditing({ column: null, taskId: null });
    setEditForm({ title: "", assignee: "", deadline: "" });
  }

  function cancelEdit() {
    setEditing({ column: null, taskId: null });
    setEditForm({ title: "", assignee: "", deadline: "" });
  }

  function handleDeleteTask(colKey, taskId) {
    if (!window.confirm("Xóa công việc này?")) return;
    setColumns((cols) => cols.map((c) => (c.key === colKey ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c)));
    // if currently editing the deleted task, close edit
    if (editing.column === colKey && editing.taskId === taskId) cancelEdit();
  }

  return (
    <Box>
      <Grid container spacing={isMobile ? 2 : 3}>
        {loading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Box sx={{ p: 3 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          </Grid>
        ) : (
          columns.map((col) => (
            <Grid item xs={12} sm={6} md={3} key={col.key}>
              <Card sx={{ height: '100%', minHeight: 400 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {col.title}
                    </Typography>

                    <IconButton
                      onClick={() => (currentForm.column === col.key ? closeForm() : openAddForm(col.key))}
                      aria-label={`Thêm công việc cho ${col.title}`}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {currentForm.column === col.key && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                      <Box component="form" onSubmit={handleAddTask} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                          name="title"
                          value={currentForm.title}
                          onChange={onFormChange}
                          placeholder="Tên công việc"
                          size="small"
                          required
                        />
                        <TextField
                          name="assignee"
                          value={currentForm.assignee}
                          onChange={onFormChange}
                          placeholder="Người phụ trách"
                          size="small"
                        />
                        <TextField
                          name="deadline"
                          value={currentForm.deadline}
                          onChange={onFormChange}
                          placeholder="Hạn (dd/mm/yyyy)"
                          size="small"
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button type="submit" variant="contained" size="small">
                            Thêm
                          </Button>
                          <Button type="button" onClick={closeForm} variant="outlined" size="small">
                            Hủy
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  )}

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {col.tasks.map((t) => (
                      <Card key={t.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          {editing.column === col.key && editing.taskId === t.id ? (
                            <Box component="form" onSubmit={saveEdit} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <TextField name="title" value={editForm.title} onChange={onEditChange} placeholder="Tên công việc" size="small" required />
                              <TextField name="assignee" value={editForm.assignee} onChange={onEditChange} placeholder="Người phụ trách" size="small" />
                              <TextField name="deadline" value={editForm.deadline} onChange={onEditChange} placeholder="Hạn (dd/mm/yyyy)" size="small" />
                              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                <Button type="submit" variant="contained" size="small">
                                  Lưu
                                </Button>
                                <Button type="button" onClick={cancelEdit} variant="outlined" size="small">
                                  Hủy
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {t.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <span>Phụ trách: {t.assignee}</span>
                                    <span sx={{ ml: 1 }}> {t.deadline}</span>
                                  </Typography>
                                </Box>

                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <IconButton
                                    onClick={() => openEditForm(col.key, t)}
                                    title="Sửa"
                                    size="small"
                                    color="primary"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => handleDeleteTask(col.key, t.id)}
                                    title="Xóa"
                                    size="small"
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}