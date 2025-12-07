import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import CommonButton from './CommonButton';

/**
 * CommonDialog - Dialog tái sử dụng cho create/edit/delete
 * 
 * @param {boolean} open - Mở/đóng dialog
 * @param {string} title - Tiêu đề dialog
 * @param {Array} fields - Danh sách field: [{name, label, type, required}, ...]
 * @param {Object} formData - Dữ liệu form
 * @param {Function} onFormChange - Callback khi thay đổi form
 * @param {Function} onClose - Callback khi đóng
 * @param {Function} onSubmit - Callback khi submit
 * @param {boolean} loading - Show loading
 * @param {string} submitLabel - Label nút submit
 * @param {React.ReactNode} children - Custom content
 * @param {Object} buttonStyles - Custom button styles: {container, cancel, submit}
 * @param {string} cancelLabel - Label nút hủy (mặc định: 'Hủy')
 * @param {boolean} centerButtons - Căn giữa các nút (mặc định: false)
 * @param {Object} PaperProps - Custom PaperProps cho Dialog
 * @param {string} submitColor - Màu nút submit: 'primary' | 'error' | 'warning' (mặc định: 'primary')
 */
export const CommonDialog = ({
  open = false,
  title = 'Dialog',
  fields = [],
  formData = {},
  onFormChange,
  onClose,
  onSubmit,
  loading = false,
  submitLabel = 'Lưu',
  children,
  buttonStyles = {},
  cancelLabel = 'Hủy',
  centerButtons = false,
  PaperProps = {},
  submitColor = 'primary',
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange?.({ ...formData, [name]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={PaperProps}>
      <DialogTitle sx={{ textAlign: centerButtons ? 'center' : 'left' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {children ? (
          <Box sx={{ textAlign: centerButtons ? 'center' : 'left' }}>
            {children}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type || 'text'}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                required={field.required}
                fullWidth
                multiline={field.multiline}
                rows={field.rows || 1}
                disabled={loading}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{
        justifyContent: centerButtons ? 'center' : 'flex-end',
        gap: 1,
        ...buttonStyles.container,
      }}>
        <CommonButton
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={buttonStyles.cancel}
        >
          {cancelLabel}
        </CommonButton>
        <CommonButton
          variant="contained"
          color={submitColor}
          onClick={onSubmit}
          loading={loading}
          sx={buttonStyles.submit}
        >
          {submitLabel}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
};

export default CommonDialog;
