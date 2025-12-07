import React from 'react';
import { Box, TextField, Stack, Typography } from '@mui/material';
import CommonButton from './CommonButton';

/**
 * CommonForm - Form tái sử dụng cho create/edit
 * 
 * @param {Array} fields - Danh sách field: [{name, label, type, required, placeholder}, ...]
 * @param {Object} formData - Dữ liệu form
 * @param {Function} onFormChange - Callback khi thay đổi form
 * @param {Function} onSubmit - Callback khi submit
 * @param {boolean} loading - Show loading
 * @param {string} submitLabel - Label nút submit
 * @param {Array} errors - Danh sách error message
 * @param {React.ReactNode} children - Custom fields
 */
export const CommonForm = ({
  fields = [],
  formData = {},
  onFormChange,
  onSubmit,
  loading = false,
  submitLabel = 'Lưu',
  errors = {},
  children,
  layout = 'vertical', // 'vertical' hoặc 'horizontal'
}) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    onFormChange?.({ ...formData, [name]: finalValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {children ? (
        children
      ) : (
        <Stack spacing={2}>
          {fields.map((field) => (
            <Box key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                type={field.type || 'text'}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                required={field.required}
                fullWidth
                placeholder={field.placeholder}
                multiline={field.multiline}
                rows={field.rows || 1}
                disabled={loading}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                variant="outlined"
              />
            </Box>
          ))}
        </Stack>
      )}

      <CommonButton
        variant="contained"
        color="primary"
        type="submit"
        loading={loading}
        fullWidth
      >
        {submitLabel}
      </CommonButton>
    </Box>
  );
};

export default CommonForm;
