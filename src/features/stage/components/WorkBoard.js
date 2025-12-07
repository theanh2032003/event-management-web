import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import StageList from "./StageList";
import TaskBoard from "./TaskBoard";

export default function WorkBoard({ projectId }) {
  const [selectedStage, setSelectedStage] = useState(null);

  function handleSelectStage(stage) {
    setSelectedStage(stage);
  }

  function handleBackToStages() {
    setSelectedStage(null);
  }

  // If a stage is selected, show task board for that stage
  if (selectedStage) {
    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToStages}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2">
            Bảng công việc: {selectedStage.name}
          </Typography>
        </Box>
        <TaskBoard 
          selectedStage={selectedStage} 
          onBackToStages={handleBackToStages} 
        />
      </Box>
    );
  }

  // Show stages list
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Các công việc theo giai đoạn
      </Typography>
      
      <StageList projectId={projectId} onStageSelect={handleSelectStage} />
    </Box>
  );
}