import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { TextField } from '@mui/material';
import { debounce } from 'lodash';

const OptimizedTextField = memo(({
  label,
  initialValue = '',
  onChange,
  onBlur: externalOnBlur,
  ...props
}) => {
  // Local state for immediate updates
  const [localValue, setLocalValue] = useState(initialValue);
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Debounced callback to parent
  const debouncedCallback = useRef(
    debounce((value) => {
      onChange({ target: { value } });
    }, 150)
  ).current;

  // Handle local changes
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue); // Update local state immediately
    debouncedCallback(newValue); // Notify parent with debounce
  }, []);

  // Handle blur - send final value to parent
  const handleBlur = useCallback((e) => {
    debouncedCallback.flush(); // Ensure parent has latest value
    if (externalOnBlur) {
      externalOnBlur(e);
    }
  }, [externalOnBlur]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, []);

  return (
    <TextField
      label={label}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.label === nextProps.label &&
    prevProps.initialValue === nextProps.initialValue &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.disabled === nextProps.disabled
  );
});

export default OptimizedTextField;