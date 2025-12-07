import React from 'react';
import { Box, Alert, AlertTitle, Container, Paper, Typography, useTheme } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * PermissionGate - Kiểm tra quyền và hiển thị thông báo hoặc nội dung
 * 
 * @param {boolean} hasPermission - Kết quả kiểm tra quyền
 * @param {React.ReactNode} children - Nội dung hiển thị nếu có quyền
 * @param {string} featureName - Tên tính năng (hiển thị trong thông báo)
 * @param {React.ReactNode} fallback - Nội dung thay thế (mặc định: thông báo "Không có quyền")
 * @param {boolean} loading - Trạng thái đang tải
 */
const PermissionGate = ({ 
  hasPermission, 
  children, 
  featureName = 'tính năng này',
  fallback = null,
  loading = false 
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  if (!hasPermission) {
    if (fallback) {
      return fallback;
    }

    return (
      <Box
        sx={{
          py: 4,
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            background: alpha(theme.palette.warning.main, 0.08),
            border: `1.5px dashed ${theme.palette.warning.main}`,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              gap: 1.5,
            }}
          >
            <LockIcon 
              sx={{ 
                fontSize: 32, 
                color: theme.palette.warning.main,
              }} 
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.warning.main,
              }}
            >
              Không có quyền truy cập
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
            <AlertTitle>Truy cập bị từ chối</AlertTitle>
            Bạn không có quyền để truy cập {featureName}. 
            Vui lòng liên hệ với quản trị viên để được cấp quyền cần thiết.
          </Alert>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default PermissionGate;
