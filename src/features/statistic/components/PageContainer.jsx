/**
 * Page Container Component
 * Provides consistent page layout and header
 */
import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const PageContainer = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  children,
}) => {
  return (
    <Box>
      {/* Header Section */}
      <Box mb={4}>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 1 }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href={crumb.href}
                sx={{ cursor: 'pointer' }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}
        
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {actions && (
            <Box display="flex" gap={2}>
              {actions}
            </Box>
          )}
        </Box>
      </Box>

      {/* Content Section */}
      {children}
    </Box>
  );
};

export default PageContainer;
