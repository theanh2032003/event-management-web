/**
 * EventFeedback - Quản lý feedback/đánh giá cho sự kiện
 * Ghép 2 API: getStatisticFeedback + getFeedback
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import feedbackApi from '../api/feedback.api';
import ChartWrapper from '../../statistic/components/ChartWrapper';
import useProjectUserPermissions from '../../permission/hooks/useProjectUserPermissions';

const EventFeedback = ({ eventData, enterpriseId, eventId }) => {
  // Permission checking
  const [userId, setUserId] = useState(null);
  const { hasPermission, isOwner } = useProjectUserPermissions(eventId, userId);

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [preview, setPreview] = useState({
    open: false,
    images: [],
    index: 0,
  });

  // Get current user ID from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      } catch (e) {
        // Ignore parse error
      }
    }
  }, []);

  useEffect(() => {
    fetchFeedbackData();
  }, [eventId, selectedRating, page, userId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      // Check permission before fetching
      const canAccess = hasPermission('project_feedback_view') || isOwner || eventData?.createdUserId === userId;
      
      console.log('Can access feedback:', canAccess);
      if (!canAccess) {
        setStatistics(null);
        setFeedbacks([]);
        setFilteredFeedbacks([]);
        setLoading(false);
        return;
      }

      // Fetch statistics
      const statsData = await feedbackApi.getStatisticFeedback(eventId);
      setStatistics(statsData);

      // Fetch feedback list
      const feedbackData = await feedbackApi.getFeedback(
        eventId,
        selectedRating,
        page - 1,
        pageSize
      );

      // Handle API response structure with 'content' array
      const feedbackList = feedbackData?.content || [];
      setFeedbacks(feedbackList);
      setTotalPages(feedbackData?.totalPages || 1);
      setTotalElements(feedbackData?.totalElements || 0);
      
      // Apply search filter to the fetched data
      if (searchKeyword) {
        const filtered = feedbackList.filter(
          (fb) =>
            fb.content?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            fb.client?.name?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setFilteredFeedbacks(filtered);
      } else {
        setFilteredFeedbacks(feedbackList);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setStatistics(null);
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleRatingFilter = (rating) => {
    setSelectedRating(selectedRating === rating ? null : rating);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFeedback(null);
  };

  const openPreview = (images, index) => {
    setPreview({ open: true, images, index });
  };

  const closePreview = () => {
    setPreview({ open: false, images: [], index: 0 });
  };

  const nextImage = () => {
    setPreview((p) => ({
      ...p,
      index: (p.index + 1) % p.images.length,
    }));
  };

  const prevImage = () => {
    setPreview((p) => ({
      ...p,
      index: (p.index - 1 + p.images.length) % p.images.length,
    }));
  };

  // Transform statistics data for chart (rating distribution)
  const ratingDistribution = statistics
    ? [
        { rating: '5 sao', count: statistics.totalFiveStar || 0 },
        { rating: '4 sao', count: statistics.totalFourStar || 0 },
        { rating: '3 sao', count: statistics.totalThreeStar || 0 },
        { rating: '2 sao', count: statistics.totalTwoStar || 0 },
        { rating: '1 sao', count: statistics.totalOneStar || 0 },
      ]
    : [];

  if (loading && !statistics && feedbacks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Permission Denied Alert */}
      {!hasPermission('feedback_manage') && !isOwner && eventData?.createdUserId !== userId && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          Bạn không có quyền truy cập feedback của sự kiện này
        </Alert>
      )}

      {/* Content - Only show if has permission */}
      {(hasPermission('feedback_manage') || isOwner || eventData?.createdUserId === userId) && (
        <>
          {/* Statistics Overview */}
          {statistics && (
            <Box
              sx={{
                mb: 4,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                alignItems: 'stretch',
                gridAutoRows: '116px',
              }}
            >
              <Box sx={{ height: '100%' }}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                  <CardContent sx={{ pb: '16px !important', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" display="block" gutterBottom sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                          Đánh giá TB
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                          {parseFloat((statistics.avgStar || 0).toFixed(2))}/5
                        </Typography>
                      </Box>
                      <StarIcon sx={{ fontSize: 24, color: '#999' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ height: '100%' }}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                  <CardContent sx={{ pb: '16px !important', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" display="block" gutterBottom sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                          Tổng feedback
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                          {statistics.totalFeedbacks || 0}
                        </Typography>
                      </Box>
                      <ThumbUpIcon sx={{ fontSize: 24, color: '#999' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ height: '100%' }}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                  <CardContent sx={{ pb: '16px !important', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" display="block" gutterBottom sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                          5 sao
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                          {statistics.totalFiveStar || 0}
                        </Typography>
                      </Box>
                      <StarIcon sx={{ fontSize: 20, color: '#FFC107' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ height: '100%' }}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                  <CardContent sx={{ pb: '16px !important', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" display="block" gutterBottom sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                          1 sao
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                          {statistics.totalOneStar || 0}
                        </Typography>
                      </Box>
                      <StarIcon sx={{ fontSize: 20, color: '#F44336' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Filter and Search */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Lọc theo đánh giá
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Chip
                    key={rating}
                    icon={<StarIcon />}
                    label={`${rating} sao`}
                    onClick={() => handleRatingFilter(rating)}
                    variant={selectedRating === rating ? 'filled' : 'outlined'}
                    color={selectedRating === rating ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              {/* Header summary */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle2">
                  Tổng cộng: <strong>{totalElements}</strong> feedback
                </Typography>
              </Box>

              {/* FIXED HEIGHT LIST - 4 comments height */}
              {filteredFeedbacks.length > 0 ? (
                <>
                  <Box
                    sx={{
                      height: "480px",
                      overflowY: "auto",
                      pr: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {filteredFeedbacks.map((fb) => (
                      <Card
                        key={fb.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          overflow: "visible",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                          <Avatar 
                            src={fb.client?.avatar} 
                            sx={{ bgcolor: "#667eea", flexShrink: 0 }}
                          >
                            {!fb.client?.avatar && (fb.client?.name?.charAt(0)?.toUpperCase() || "U")}
                          </Avatar>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            {/* Name + Rating */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Typography sx={{ fontWeight: 600 }}>
                                {fb.client?.name || "Người dùng"}
                              </Typography>
                              <Rating value={fb.rating || 0} readOnly size="small" />
                            </Box>

                            <Typography variant="body2" sx={{ mb: 1.5, fontSize: "0.95rem", lineHeight: 1.5 }}>
                              {fb.content || "Không có nhận xét"}
                            </Typography>

                            {/* Images */}
                            {fb.images?.length > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                  mb: 1.5,
                                }}
                              >
                                {fb.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt=""
                                    onClick={() => openPreview(fb.images, idx)}
                                    style={{
                                      width: "90px",
                                      height: "90px",
                                      objectFit: "cover",
                                      borderRadius: 8,
                                      border: "1px solid #ddd",
                                      cursor: "pointer",
                                    }}
                                  />
                                ))}
                              </Box>
                            )}

                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary", display: "block", fontSize: "0.8rem" }}
                            >
                              {new Date(fb.createdAt).toLocaleDateString("vi-VN")}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>

                  {/* Pagination */}
                  <Box display="flex" justifyContent="center">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <InfoIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {searchKeyword ? "Không tìm thấy feedback phù hợp" : "Chưa có feedback nào"}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* IMAGE PREVIEW MODAL WITH NEXT/PREV */}
          <Modal open={preview.open} onClose={closePreview}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {/* Prev button */}
              {preview.images.length > 1 && (
                <IconButton
                  onClick={prevImage}
                  sx={{ 
                    color: "white", 
                    position: "absolute", 
                    left: "-80px",
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                  }}
                >
                  &lt;
                </IconButton>
              )}

              {/* Image */}
              <Box
                sx={{
                  width: "600px",
                  height: "600px",
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                <img
                  src={preview.images[preview.index]}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </Box>

              {/* Next button */}
              {preview.images.length > 1 && (
                <IconButton
                  onClick={nextImage}
                  sx={{ 
                    color: "white", 
                    position: "absolute", 
                    right: "-80px",
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                  }}
                >
                  &gt;
                </IconButton>
              )}
            </Box>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default EventFeedback;
