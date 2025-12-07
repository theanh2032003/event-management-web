import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Paper,
  styled,
  alpha,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Inbox as InboxIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import stageApi from "../api/stage.api";
import projectApi from "../../project/api/project.api";
import groupTaskStateApi from "../../state_setting/api/groupTaskStateApi";
import groupTaskTypeApi from "../../type_setting/api/groupTaskTypeApi";
import StageTable from "../components/StageTable";
import StageDialog from "../components/StageDialog";
import { parseDateTimeLocal } from "../../../shared/utils/dateFormatter";

// Styled Components
const HeaderBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

/**
 * EventTask - Task/Stage management page
 * Displays list of stages with expand/collapse functionality
 * Future: Will show tasks under each stage
 */
export default function EventTask({ projectId: propProjectId, enterpriseId: propEnterpriseId, eventData }) {
  const { eventId, id: paramsEnterpriseId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use projectId and enterpriseId from props if provided, otherwise use params
  const projectId = propProjectId || eventId;
  const enterpriseId = propEnterpriseId || paramsEnterpriseId;

  // State
  const [stages, setStages] = useState([]);
  const [taskStates, setTaskStates] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);

  // Fetch stages on mount - Tab "Công việc" không cần check quyền
  useEffect(() => {
    if (eventId) {
      fetchStages();
      fetchTaskStates();
      fetchTaskTypes();
    }
  }, [eventId]);

  /**
   * Fetch all stages with pagination
   */
  const fetchStages = async (currentPage = page, currentPageSize = pageSize) => {
    setLoading(true);
    setError("");
    try {
      // console.log("📡 Fetching stages for eventId:", eventId);
      const response = await stageApi.getAll(eventId, {
        page: currentPage,
        size: currentPageSize,
      });
      // console.log("🔍 API Stage Response:", response);
      
      // Handle response structure
      const stageList = response.data?.data || response.data?.content || response.data || [];
      const total = response.data?.totalElements || response.data?.total || stageList.length;
      const pages = response.data?.totalPages || Math.ceil(total / currentPageSize);
      
      setStages(stageList);
      setTotalData(total);
      setTotalPages(pages);
      
      // console.log("📊 Loaded stages:", stageList.length);
    } catch (err) {
      console.error("❌ Error fetching stages:", err);
      setError(err.message || "Không thể tải danh sách giai đoạn");
      showSnackbar("Không thể tải danh sách giai đoạn", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch task states from project
   */
  const fetchTaskStates = async () => {
    try {
      console.log("🔍 Fetching task states for projectId:", eventId, "enterpriseId:", enterpriseId);
      
      const response = await groupTaskStateApi.filter(
        {
          projectId: eventId,
          keyword: "",
          pageable: {
            page: 0,
            size: 100,
            sort: []
          }
        },
        enterpriseId
      );

      console.log("🔍 Full Response:", response);
      console.log("🔍 Response.data:", response.data);

      const groups = response.data || [];
      console.log("🔍 Groups:", groups);

      // Flatten list of all states from all groups
      const allStates = groups.flatMap(group => group.states || []);
      
      console.log("🔍 All Task States:", allStates);
      console.log("🔍 Task States length:", allStates.length);
      
      setTaskStates(allStates);
    } catch (err) {
      console.error("❌ Error fetching task states:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
    }
  };
   /**
   * Fetch task types from project
   */
  
  const fetchTaskTypes = async () => {
    try {
      console.log("🔍 Fetching task types for projectId:", eventId, "enterpriseId:", enterpriseId);
      
      const response = await groupTaskTypeApi.filter(
        {
          projectId: eventId,
          keyword: "",
          pageable: {
            page: 0,
            size: 100,
            sort: []
          }
        },
        enterpriseId
      );

      console.log("🔍 Types Full Response:", response);

      const groups = response.data || [];
      console.log("🔍 Groups types:", groups);

      // Flatten list of all types from all groups
      const allTypes = groups.flatMap(group => group.types || []);
      
      console.log("🔍 All Task types:", allTypes);
      console.log("🔍 Task types length:", allTypes.length);
      
      setTaskTypes(allTypes);
    } catch (err) {
      console.error("❌ Error fetching task type:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
    }
  };

  /**
   * Get current user ID from localStorage
   */
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || "";
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
    return "";
  };

  /**
   * Handle create/update stage
   */
  const handleSaveStage = async (stageForm, stageId) => {
    setSubmitting(true);
    try {
      const userId = getCurrentUserId();
      
      // Prepare payload
      const payload = {
        name: stageForm.name,
        description: stageForm.description,
        startedAt: parseDateTimeLocal(stageForm.startedAt),
        endedAt: parseDateTimeLocal(stageForm.endedAt),
        userIds: stageForm.userIds && stageForm.userIds.length > 0 
          ? stageForm.userIds 
          : (userId ? [userId] : []), // Use selected users or fallback to current user
      };

      // Add status only for update
      if (stageId) {
        payload.status = stageForm.status;
      }

      // Add location if provided
      if (stageForm.locationId) {
        payload.locationId = stageForm.locationId;
      }

      // console.log("📤 Sending stage to API:", payload);
      // console.log("📍 Using eventId:", eventId);
      // console.log("👤 User IDs:", payload.userIds);

      if (stageId) {
        // Update
        await stageApi.update(eventId, stageId, payload);
        showSnackbar("Cập nhật giai đoạn thành công", "success");
      } else {
        // Create
        await stageApi.create(eventId, payload);
        showSnackbar("Tạo giai đoạn thành công", "success");
      }

      setDialogOpen(false);
      setSelectedStage(null);
      fetchStages();
    } catch (err) {
      console.error("❌ Error saving stage:", err);
      showSnackbar(
        err.message || "Không thể lưu giai đoạn",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete stage
   */
  const handleDeleteStage = async (stage) => {
    if (!window.confirm(`Bạn có chắc muốn xóa giai đoạn "${stage.name}"?`)) {
      return;
    }

    try {
      await stageApi.delete(eventId, stage.id);
      showSnackbar("Xóa giai đoạn thành công", "success");
      fetchStages();
    } catch (err) {
      console.error("❌ Error deleting stage:", err);
      // Check for specific error message from backend
      const errorMessage = err.response?.data?.message || "Không thể xóa giai đoạn";
      showSnackbar(errorMessage, "error");
    }
  };

  /**
   * Handle change stage status
   */
  const handleChangeStatus = async (stage, newStatus) => {
    if (stage.status === newStatus) {
      showSnackbar("Trạng thái không thay đổi", "info");
      return;
    }

    try {
      await stageApi.updateStatus(eventId, stage.id, newStatus);
      showSnackbar("Cập nhật trạng thái thành công", "success");
      fetchStages();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      showSnackbar(err.message || "Không thể cập nhật trạng thái", "error");
    }
  };

  /**
   * Open dialog for creating new stage
   */
  const handleAddStage = () => {
    setSelectedStage(null);
    setDialogOpen(true);
  };

  /**
   * Open dialog for editing stage
   */
  const handleEditStage = (stage) => {
    setSelectedStage(stage);
    setDialogOpen(true);
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{paddingTop: 'none'}}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStage}
          disabled={loading}
          sx={{margin: '10px 10px 0px 0px'}}
        >
          Thêm giai đoạn
        </StyledButton>
      </Box>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
          }} 
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Content - Luôn hiển thị, không cần alert quyền */}
      <>
        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress size={50} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              Đang tải giai đoạn...
            </Typography>
          </Box>
        ) : stages.length === 0 ? (
          <EmptyStateBox>
            <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Chưa có giai đoạn nào
            </Typography>
          </EmptyStateBox>
        ) : (
          /* Stage Table */
          <>
            <StageTable
              stages={stages}
              onEdit={handleEditStage}
              onDelete={handleDeleteStage}
              onChangeStatus={handleChangeStatus}
              projectId={projectId}
              enterpriseId={enterpriseId}
              taskStates={taskStates}
              taskTypes={taskTypes}
            />

            {/* Pagination */}
            {totalData > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                {/* Page Size Selector */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Select
                    size="small"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(e.target.value);
                      setPage(0);
                      fetchStages(0, e.target.value);
                    }}
                    sx={{ minWidth: 70 }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                  <Typography variant="body2" color="text.secondary">
                    Trên tổng {totalData} giai đoạn
                  </Typography>
                </Box>

                {/* Page Numbers Navigation */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                  {/* Previous Arrow */}
                  <IconButton
                    size="small"
                    disabled={page === 0}
                    onClick={() => {
                      const newPage = Math.max(0, page - 1);
                      setPage(newPage);
                      fetchStages(newPage, pageSize);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 16 }}>‹</Typography>
                  </IconButton>

                  {/* Generate Page Numbers */}
                  {(() => {
                    const pages = [];
                    const currentPage = page + 1;

                    // If total pages <= 5, show all pages
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show first 2 pages
                      pages.push(1, 2);

                      // Add ellipsis
                      pages.push("...");

                      // Show last 2 pages
                      pages.push(totalPages - 1, totalPages);
                    }

                    return pages.map((pageNum, idx) => {
                      if (pageNum === "...") {
                        return (
                          <Typography key={`ellipsis-${idx}`} sx={{ px: 0.5, color: "text.secondary" }}>
                            ...
                          </Typography>
                        );
                      }

                      const isCurrentPage = pageNum === currentPage;
                      return (
                        <Button
                          key={pageNum}
                          size="small"
                          onClick={() => {
                            setPage(pageNum - 1);
                            fetchStages(pageNum - 1, pageSize);
                          }}
                          sx={{
                            minWidth: 32,
                            p: 0.5,
                            fontWeight: isCurrentPage ? "bold" : "normal",
                            bgcolor: isCurrentPage ? "primary.main" : "transparent",
                            color: isCurrentPage ? "primary.contrastText" : "text.primary",
                            "&:hover": {
                              bgcolor: isCurrentPage ? "primary.dark" : "action.hover",
                            },
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    });
                  })()}

                  {/* Next Arrow */}
                  <IconButton
                    size="small"
                    disabled={page >= totalPages - 1}
                    onClick={() => {
                      const newPage = Math.min(totalPages - 1, page + 1);
                      setPage(newPage);
                      fetchStages(newPage, pageSize);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 16 }}>›</Typography>
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Stage Dialog */}
        <StageDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedStage(null);
          }}
          stage={selectedStage}
          onSave={handleSaveStage}
          submitting={submitting}
          isMobile={isMobile}
          projectId={projectId}
          enterpriseId={enterpriseId}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    </Box>
  );
}
