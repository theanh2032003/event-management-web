import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import stageApi from "../api/stage.api";

export default function StageList({ projectId, onStageSelect }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stages from API
  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        const response = await stageApi.getStagesByProject(projectId);
        const stagesData = response?.data?.data || response?.data || response;
        setStages(Array.isArray(stagesData) ? stagesData : []);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
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

  if (stages.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">Không có giai đoạn nào</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Các công việc theo giai đoạn
        </Typography>
      </Box>

      <Table sx={{ border: "1px solid #ddd" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #ddd" }}>
              Tên giai đoạn
            </TableCell>
            <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #ddd" }}>
              Ngày bắt đầu
            </TableCell>
            <TableCell sx={{ fontWeight: 600, borderBottom: "1px solid #ddd" }}>
              Ngày kết thúc
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, borderBottom: "1px solid #ddd" }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stages.map((stage) => (
            <TableRow key={stage.id} sx={{ borderBottom: "1px solid #ddd" }}>
              <TableCell sx={{ py: 1.5 }}>{stage.name}</TableCell>
              <TableCell sx={{ py: 1.5 }}>
                {stage.startDate || stage.start || '-'}
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                {stage.endDate || stage.end || '-'}
              </TableCell>
              <TableCell align="center" sx={{ py: 1.5 }}>
                <Button
                  onClick={() => onStageSelect(stage)}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#1976d2",
                    '&:hover': {
                      backgroundColor: "#1565c0",
                    }
                  }}
                >
                  Xem công việc
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}