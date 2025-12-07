import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
} from '@mui/material';
import { ImageUpload } from './ImageUpload';
import OptimizedTextField from '../../../shared/components/OptimizedTextField';

const LocationFormDialog = memo(({
  open,
  onClose,
  isMobile,
  editingLocation,
  formData,
  onNameChange,
  onAddressChange,
  onCapacityChange,
  onPriceChange,
  onRemoveImage,
  onImageUpload,
  onSave,
  uploadingImages
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      fullScreen={isMobile}
    >
      <DialogTitle>
        {editingLocation ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <OptimizedTextField 
            label="Tên địa điểm" 
            fullWidth 
            initialValue={formData.name} 
            onChange={onNameChange}
          />
          <OptimizedTextField 
            label="Địa chỉ" 
            fullWidth 
            initialValue={formData.address} 
            onChange={onAddressChange}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <OptimizedTextField 
              label="Sức chứa" 
              fullWidth 
              initialValue={formData.capacity} 
              onChange={onCapacityChange}
            />
            <OptimizedTextField 
              label="Giá" 
              fullWidth 
              initialValue={formData.pricePerHour} 
              onChange={onPriceChange}
            />
          </Box>
          
          <ImageUpload
            imagePreview={formData.imagePreview}
            handleRemoveImage={onRemoveImage}
            handleLocationImageUpload={onImageUpload}
            uploadingImages={uploadingImages}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onSave} variant="contained">
          {editingLocation ? "Cập nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Return true if props are equal (skip re-render), false if different (do re-render)
  const shouldSkipRender = (
    prevProps.open === nextProps.open &&
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.editingLocation?.id === nextProps.editingLocation?.id &&
    prevProps.formData.name === nextProps.formData.name &&
    prevProps.formData.address === nextProps.formData.address &&
    prevProps.formData.capacity === nextProps.formData.capacity &&
    prevProps.formData.pricePerHour === nextProps.formData.pricePerHour &&
    prevProps.formData.imagePreview === nextProps.formData.imagePreview &&
    prevProps.uploadingImages === nextProps.uploadingImages &&
    prevProps.onNameChange === nextProps.onNameChange &&
    prevProps.onAddressChange === nextProps.onAddressChange &&
    prevProps.onCapacityChange === nextProps.onCapacityChange &&
    prevProps.onPriceChange === nextProps.onPriceChange &&
    prevProps.onRemoveImage === nextProps.onRemoveImage &&
    prevProps.onImageUpload === nextProps.onImageUpload &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.onClose === nextProps.onClose
  );
  return shouldSkipRender;
});

export default LocationFormDialog;