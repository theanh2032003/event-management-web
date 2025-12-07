import React, { memo, useCallback } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const imageUploadStyles = {
  wrapper: {
    width: 70,
    height: 70,
    borderRadius: 2,
    border: '2px dashed',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    bgcolor: 'background.default',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: 'action.hover',
    },
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    bgcolor: 'background.paper',
    boxShadow: 2,
    '&:hover': {
      bgcolor: 'error.main',
      color: 'error.contrastText',
    },
  }
};

export const ImageUpload = memo(({ imagePreview, handleRemoveImage, handleLocationImageUpload, uploadingImages }) => {
  const handleRemove = useCallback((e) => {
    e.preventDefault();
    handleRemoveImage();
  }, [handleRemoveImage]);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        Hình ảnh địa điểm {uploadingImages && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Typography>
      <Box sx={imageUploadStyles.wrapper} component="label">
        {imagePreview ? (
          <>
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={imageUploadStyles.image}
            />
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={imageUploadStyles.removeButton}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <CloudUploadIcon sx={{ fontSize: 25, mb: 1 }} />
          </Box>
        )}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleLocationImageUpload}
          disabled={uploadingImages}
        />
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (do re-render)
  return (
    prevProps.imagePreview === nextProps.imagePreview &&
    prevProps.uploadingImages === nextProps.uploadingImages &&
    prevProps.handleRemoveImage === nextProps.handleRemoveImage &&
    prevProps.handleLocationImageUpload === nextProps.handleLocationImageUpload
  );
});