/**
 * Chart Wrapper Component
 * Provides consistent styling for all charts
 */
import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const ChartWrapper = ({ title, subtitle, children, loading = false, height = 400 }) => {
  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={height}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box height={height}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;
