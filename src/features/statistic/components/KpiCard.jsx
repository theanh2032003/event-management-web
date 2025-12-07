/**
 * KPI Card Component
 * Reusable card for displaying key performance indicators
 */
import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary.main',
  format = 'number',
}) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(val);
    }
    if (format === 'percent') {
      return `${val}%`;
    }
    if (format === 'number') {
      return new Intl.NumberFormat('vi-VN').format(val);
    }
    return val;
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={700}>
              {formatValue(value)}
            </Typography>
          </Box>
          {Icon && (
            <Avatar
              sx={{
                bgcolor: color,
                width: 56,
                height: 56,
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Avatar>
          )}
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {trend === 'up' ? (
              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trend === 'up' ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {trendValue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              so với tháng trước
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
