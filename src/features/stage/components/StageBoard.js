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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import TaskBoard from "./TaskBoard";
import stageApi from "../api/stage.api";

export default function StageBoard({ projectId, onStageSelect }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", color: "#06b6d4", start: "", end: "" });
  const [selectedStage, setSelectedStage] = useState(null);

  // Fetch stages from API
  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        const response = await stageApi.getStagesByProject(projectId);
        const stagesData = response?.data?.data || response?.data || response;
        setStages(Array.isArray(stagesData) ? stagesData : []);
        
        // Initialize expanded state
        const expandedState = {};
        stagesData?.forEach(s => {
          expandedState[s.id] = false;
        });
        setExpanded(expandedState);
      } catch (err) {
        console.error('Error fetching stages:', err);
        setError(err.response?.data?.message || 'Không thể tải giai đoạn');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchStages();
    }
  }, [projectId]);

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const parse = (s) => {
    if (!s) return null;
    const d = new Date(s + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // recompute calendar range from current stages
  const minStart = stages.reduce((min, s) => {
    if (!s.start) return min;
    const d = parse(s.start);
    return !min || d < min ? d : min;
  }, null);
  const maxEnd = stages.reduce((max, s) => {
    if (!s.end) return max;
    const d = parse(s.end);
    return !max || d > max ? d : max;
  }, null);

  const days = [];
  if (minStart && maxEnd) {
    for (let d = new Date(minStart); d <= maxEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
  }

  const indexOfDay = (dateStr) => {
    const d = parse(dateStr);
    return days.findIndex((dd) => dd.getTime() === d.getTime());
  };

  const formatDay = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

  // column pixel width for each day in the calendar
  const colWidth = 50;
  const dayCount = Math.max(1, days.length);
  const calendarMinWidth = dayCount * colWidth;

  function onAddChange(e) {
    const { name, value } = e.target;
    setAddForm((f) => ({ ...f, [name]: value }));
  }

  async function handleAddStage(e) {
    e.preventDefault();
    if (!addForm.name || !addForm.start || !addForm.end) return;

    try {
      const newStageData = {
        name: addForm.name,
        color: addForm.color || "#06b6d4",
        startDate: addForm.start,
        endDate: addForm.end,
        projectId: projectId,
      };

      const response = await stageApi.createStage(newStageData);
      const newStage = response?.data?.data || response?.data || response;
      
      setStages((s) => [newStage, ...s]);
      setExpanded((ex) => ({ ...ex, [newStage.id]: true }));
      setShowAdd(false);
      setAddForm({ name: "", color: "#06b6d4", start: "", end: "" });
    } catch (err) {
      console.error('Error adding stage:', err);
    }
  }

  function handleSelectStage(stage) {
    setSelectedStage(stage);
  }

  function handleBackToStages() {
    setSelectedStage(null);
  }

  // If a stage is selected, show task board for that stage
  if (selectedStage) {
    return (
      <TaskBoard 
        selectedStage={selectedStage} 
        onBackToStages={handleBackToStages} 
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" component="h1">
          Các giai đoạn làm việc
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAdd((s) => !s)}
        >
          Thêm giai đoạn
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              {/* add form */}
              {showAdd && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                  <Box component="form" onSubmit={handleAddStage} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                      name="name"
                      value={addForm.name}
                      onChange={onAddChange}
                      placeholder="Tên giai đoạn"
                      size="small"
                      required
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        name="start"
                        value={addForm.start}
                        onChange={onAddChange}
                        type="date"
                        size="small"
                        required
                      />
                      <TextField
                        name="end"
                        value={addForm.end}
                        onChange={onAddChange}
                        type="date"
                        size="small"
                        required
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <TextField
                        name="color"
                        value={addForm.color}
                        onChange={onAddChange}
                        type="color"
                        size="small"
                        label="Màu"
                      />
                      <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
                        <Button type="submit" variant="contained" size="small">
                          Lưu
                        </Button>
                        <Button type="button" onClick={() => setShowAdd(false)} variant="outlined" size="small">
                          Hủy
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {stages.map((s) => (
                  <Card key={s.id} variant="outlined" sx={{ overflow: "hidden" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        cursor: "pointer",
                        bgcolor: expanded[s.id] ? "grey.100" : "transparent",
                      }}
                      onClick={() => toggle(s.id)}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: s.color,
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {s.name}
                      </Typography>
                      <Box sx={{ ml: "auto" }}>
                        <IconButton size="small">
                          {expanded[s.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>

                    {expanded[s.id] && (
                      <Box sx={{ p: 2, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Bắt đầu:</strong> {s.start}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Kết thúc:</strong> {s.end}
                        </Typography>
                        
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleSelectStage(s)}
                          >
                            Xem công việc
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: calendar area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', overflow: 'hidden' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ minWidth: calendarMinWidth }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${dayCount}, ${colWidth}px)`, gap: 1 }}>
                    {days.length
                      ? days.map((d, idx) => (
                          <Box key={idx} sx={{ p: 1, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", fontSize: 12 }}>
                            {formatDay(d)}
                          </Box>
                        ))
                      : // if no days, show empty header cell
                        <Box sx={{ p: 1, textAlign: "center", fontSize: 12 }}>—</Box>}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "grid", gridTemplateRows: `repeat(${stages.length}, 56px)`, gap: 1.5 }}>
                      {stages.map((s) => {
                        const startIdx = Math.max(0, indexOfDay(s.start));
                        const endIdx = Math.max(0, indexOfDay(s.end));
                        const colStart = startIdx + 1;
                        const colEnd = endIdx + 2;

                        return (
                          <Box key={s.id} sx={{ position: "relative", minHeight: 56 }}>
                            <Box sx={{ position: "absolute", left: 0, right: 0 }}>
                              <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${dayCount}, ${colWidth}px)`, gap: 1 }}>
                                {Array.from({ length: dayCount }).map((_, i) => (
                                  <Box key={i} sx={{ height: 56, border: "1px dashed transparent" }} />
                                ))}
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                height: 56,
                                display: "grid",
                                gridTemplateColumns: `repeat(${dayCount}, ${colWidth}px)`,
                              }}
                            >
                              <Box sx={{ gridColumn: `${colStart} / ${colEnd}`, alignSelf: "center", p: 1 }}>
                                <Box sx={{ bgcolor: s.color, color: "#fff", p: 1, borderRadius: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {s.name}
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}