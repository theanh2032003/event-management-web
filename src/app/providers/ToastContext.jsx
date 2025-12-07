import React, { createContext, useState, useCallback } from "react";
import { Snackbar, Alert, LinearProgress, Box, Slide } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// ============================================
// TOAST CONTEXT
// ============================================

const ToastContext = createContext();

/**
 * Hook để sử dụng Toast Context
 */
export const useToast = () => React.useContext(ToastContext);

/**
 * Transition animation: slide from right
 */
const SlideTransition = (props) => <Slide {...props} direction="left" />;

// ============================================
// TOAST PROVIDER COMPONENT
// ============================================

/**
 * ToastProvider với linear progress bar
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, severity = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, severity, duration, open: true };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => hideToast(id), duration);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, open: false } : toast))
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  // Context value với shorthand methods
  const value = {
    showToast,
    hideToast,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration),
  };

return (
  <ToastContext.Provider value={value}>
    {children}
    {toasts.map((toast, index) => (
      <Snackbar
        key={toast.id}
        open={toast.open}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
        sx={{ top: `${80 + index * 90}px !important` }}
      >
        <Alert
          variant="outlined"
          severity={toast.severity}
          iconMapping={{
            success: <CheckCircleIcon fontSize="small" />,
            error: <ErrorIcon fontSize="small" />,
            warning: <WarningIcon fontSize="small" />,
            info: <InfoIcon fontSize="small" />,
          }}
          sx={{
            width: 280,
            minHeight: 50,
            bgcolor: '#fff',
            color: '#000',
            boxShadow: 2,
            border: '1px solid #e0e0e0',
            borderBottom: 'none',
            borderLeft: `5px solid ${
              toast.severity === 'success'
                ? '#4caf50'
                : toast.severity === 'error'
                ? '#f44336'
                : toast.severity === 'warning'
                ? '#ff9800'
                : '#2196f3'
            }`,
            position: 'relative',
            overflow: 'hidden',
            fontSize: '0.875rem',
            fontWeight: 500,
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '& .MuiAlert-icon': {
              fontSize: '18px',
            },
          }}
        >
          {toast.message}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 5,
              bgcolor: 'transparent',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 10,
                bgcolor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    toast.severity === 'success'
                      ? '#4caf50'
                      : toast.severity === 'error'
                      ? '#f44336'
                      : toast.severity === 'warning'
                      ? '#ff9800'
                      : '#2196f3',
                  animation: `progressAnimation ${toast.duration}ms linear`,
                  transformOrigin: 'left',
                },
              }}
            />
          </Box>
        </Alert>
      </Snackbar>
    ))}
    <style>
      {`
        @keyframes progressAnimation {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}
    </style>
  </ToastContext.Provider>
);


};

export default ToastContext;
