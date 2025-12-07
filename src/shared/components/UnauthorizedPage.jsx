import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * UnauthorizedPage - Hiển thị khi user không có quyền
 */
export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <ErrorOutlineIcon
        sx={{
          fontSize: 80,
          color: 'error.main',
          mb: 2,
        }}
      />
      <Typography variant="h3" gutterBottom>
        403 - Truy cập bị từ chối
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Bạn không có quyền để truy cập trang này.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(-1)}
        sx={{ mr: 1 }}
      >
        Quay lại
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate('/select-workspace')}
      >
        Về trang chủ
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
