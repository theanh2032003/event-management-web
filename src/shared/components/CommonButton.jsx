import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

/**
 * CommonButton - Button tái sử dụng với các variant thường dùng
 * 
 * @param {string} variant - 'contained' | 'outlined' | 'text'
 * @param {string} color - 'primary' | 'secondary' | 'error' | 'success' | 'warning'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {React.ReactNode} children - Button text or content
 * @param {Function} onClick - Click handler
 * @param {object} rest - Other MUI Button props
 */
export const CommonButton = ({
  variant = 'contained',
  color = 'primary',
  loading = false,
  disabled = false,
  size = 'medium',
  children,
  onClick,
  fullWidth = false,
  ...rest
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      fullWidth={fullWidth}
      {...rest}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </MuiButton>
  );
};

export default CommonButton;
