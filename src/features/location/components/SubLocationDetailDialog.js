import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const SubLocationDetailDialog = memo(({
  open,
  onClose,
  subLocation,
  isMobile,
}) => {
  if (!subLocation) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Chi tiết địa điểm con</Typography>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tên địa điểm con
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {subLocation?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Chi tiết
              </Typography>
              <Typography variant="body1">
                {subLocation?.detail || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mô tả
              </Typography>
              <Typography variant="body1">
                {subLocation?.description || '-'}
              </Typography>
            </Grid>

            {/* Images Section */}
            {subLocation?.images && subLocation?.images.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Hình ảnh ({subLocation?.images.length})
                </Typography>
                <Grid container spacing={2}>
                  {subLocation?.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        component="img"
                        src={image}
                        alt={`Image ${index + 1}`}
                        sx={{
                          width: '100%',
                          borderRadius: 2,
                          objectFit: 'cover',
                          maxHeight: 250,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.open === nextProps.open &&
    prevProps.subLocation?.id === nextProps.subLocation?.id &&
    prevProps.isMobile === nextProps.isMobile
  );
});

export default SubLocationDetailDialog;