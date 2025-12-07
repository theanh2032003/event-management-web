import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageIcon from '@mui/icons-material/Language';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import authApi from '../../auth/api/auth.api';
import enterpriseApi from '../../enterprise/api/enterprise.api';
import supplierApi from '../../supplier/api/supplier.api';
import { PermissionContext } from '../../../shared/contexts/PermissionContext';
import { useAuth } from '../../../app/providers/AuthContext';
import EventMALogo from '../../../assets/images/EventMAlogo.png';
import { uploadToCloudinary } from '../../../shared/utils/uploadToCloudinary';
import { useInView } from 'react-intersection-observer';

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}15 50%, ${theme.palette.background.default} 100%)`,
}));

const LogoSection = styled(Box)(({ theme }) => ({
  width: '50%',
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(4),
  borderRight: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(4),
    borderRight: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  textAlign: 'center',
  '& img': {
    maxWidth: '180px',
    height: 'auto',
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  width: '50%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(3),
  },
}));

const WorkspaceGridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(0.5),
  width: '100%',
  height: '220px',
  overflow: 'auto',
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '3px',
    '&:hover': {
      background: theme.palette.text.secondary,
    },
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    height: '400px',
  },
}));

const WorkspaceCard = styled(MuiCard)(({ theme, isBlocked }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  cursor: isBlocked ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${isBlocked ? theme.palette.error.main : theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  height: '70px',
  opacity: isBlocked ? 0.6 : 1,
  '&:hover': isBlocked ? {} : {
    backgroundColor: theme.palette.action.hover,
  },
  ...theme.applyStyles('dark', {
    background: 'rgba(30, 30, 30, 0.8)',
    '&:hover': isBlocked ? {} : {
      background: 'rgba(40, 40, 40, 0.9)',
      borderColor: theme.palette.primary.main,
    },
  }),
}));

const WorkspaceInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  flex: 1,
  minWidth: 0,
}));

const WorkspaceName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '0.95rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
}));

const WorkspaceSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const WorkspaceOwner = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}))

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: '20px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  fontSize: '1.25rem',
}));

const CreateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
  border: `2px dashed ${theme.palette.divider}`,
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    ...theme.applyStyles('dark', {
      background: 'rgba(18, 18, 18, 0.98)',
    }),
  },
}));

// Helper function to get color hex for avatar URL
const getColorHex = (color) => {
  if (typeof color === 'string') {
    return color.replace('#', '');
  }
  return '1976d2'; // Default blue
};

// Lazy-loaded workspace card component
const LazyWorkspaceCard = React.forwardRef(({ workspace, type, userId, onSelect, theme }, ref) => {
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const avatarUrl = workspace.logo || workspace.avatar || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(workspace.name)}&background=${getColorHex(theme.palette.secondary.main)}&color=fff&size=64&bold=true`;

  return (
    <div ref={inViewRef}>
      {inView && (
        <WorkspaceCard
          ref={ref}
          isBlocked={workspace.state === 'BLOCK'}
          onClick={() => workspace.state !== 'BLOCK' && onSelect(type, workspace.id)}
        >
          
          <Avatar
            src={avatarUrl}
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              border: `2px solid`,
              borderColor: 'secondary.light',
            }}
          />
          <WorkspaceInfo>
            <WorkspaceName>{workspace.name}</WorkspaceName>
            {workspace.ownerId === userId && (
              <WorkspaceOwner>Chủ sở hữu</WorkspaceOwner>
            )}
          </WorkspaceInfo>
          {workspace.state === 'BLOCK' && (
            <StyledChip
              label="Bị khóa"
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </WorkspaceCard>
      )}
    </div>
  );
});

LazyWorkspaceCard.displayName = 'LazyWorkspaceCard';

export default function SelectWorkspacePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const auth = useAuth();
  const permissionContext = useContext(PermissionContext);
  const [activeTab, setActiveTab] = React.useState('company');
  const [suppliers, setSuppliers] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Extract userId from token
  const userObj = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  }, []);
  const userId = userObj.id;
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    tax: '',
    fanpage: '',
    website: '',
    description: '',
    avatar: ''
  });
  const [formErrors, setFormErrors] = React.useState({
    name: '',
    phone: '',
    email: '',
    tax: '',
    fanpage: '',
    website: '',
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchWorkspaces = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get suppliers from API
      try {
        const suppliersResponse = await supplierApi.getSuppliers('', 0, 100); // Fetch first 100 suppliers
        
        // Extract data array from response
        let suppliersArray = [];
        if (Array.isArray(suppliersResponse)) {
          suppliersArray = suppliersResponse;
        } else if (suppliersResponse?.data && Array.isArray(suppliersResponse.data)) {
          suppliersArray = suppliersResponse.data;
        } else if (suppliersResponse?.data?.data && Array.isArray(suppliersResponse.data.data)) {
          suppliersArray = suppliersResponse.data.data;
        }
        
        setSuppliers(suppliersArray);
        
        if (suppliersArray.length === 0) {
        }
      } catch (err) {
        setError('Không thể tải danh sách nhà cung cấp. ' + (err?.response?.data?.message || err.message || ''));
        setSuppliers([]);
      }
      
      // Get enterprises from API
      try {
        const enterprisesResponse = await enterpriseApi.getEnterprises('', 0, 100); // Fetch first 100 enterprises
        
        // Extract data array from response
        let companiesArray = [];
        if (Array.isArray(enterprisesResponse)) {
          companiesArray = enterprisesResponse;
        } else if (enterprisesResponse?.data && Array.isArray(enterprisesResponse.data)) {
          companiesArray = enterprisesResponse.data;
        } else if (enterprisesResponse?.data?.data && Array.isArray(enterprisesResponse.data.data)) {
          companiesArray = enterprisesResponse.data.data;
        }
        
        setCompanies(companiesArray);
        
        if (companiesArray.length === 0) {
        }
      } catch (err) {
        setError('Không thể tải danh sách doanh nghiệp. ' + (err?.response?.data?.message || err.message || ''));
        setCompanies([]);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);


  const handleSelectWorkspace = async (type, id) => {
    try {
      let response;
      
      if (type === 'supplier') {
        // Call API: POST /auth/switch/supplier/{supplierId}
        response = await authApi.switchSupplier(id);
        
        // Extract tokens
        const accessToken = response?.accessToken || response?.data?.accessToken;
        const refreshToken = response?.refreshToken || response?.data?.refreshToken;
        
        // Save new tokens to localStorage
        if (accessToken) {
          localStorage.setItem('token', accessToken);
        }
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Save workspace info to localStorage
        const supplier = suppliers.find(s => s.id === id);
        if (supplier) {
          localStorage.setItem('currentWorkspace', JSON.stringify({
            id: supplier.id,
            name: supplier.name,
            type: 'supplier'
          }));
          // Also save to AuthContext
          auth.setWorkspace(supplier.id, 'supplier');
        }

        // Fetch permissions từ API
        if (permissionContext) {
          const userObj = JSON.parse(localStorage.getItem('user') || '{}');
          await permissionContext.fetchPermissions(userObj.id);
        }
        
        // Navigate to supplier dashboard
        navigate(`/supplier/${id}/dashboard`);
        
      } else if (type === 'company') {
        // Call API: POST /auth/switch/enterprise/{enterpriseId}
        response = await authApi.switchEnterprise(id);
        
        // Extract tokens
        const accessToken = response?.accessToken || response?.data?.accessToken;
        const refreshToken = response?.refreshToken || response?.data?.refreshToken;
        
        // Save new tokens to localStorage
        if (accessToken) {
          localStorage.setItem('token', accessToken);
        }
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Save workspace info to localStorage
        const company = companies.find(c => c.id === id);
        if (company) {
          localStorage.setItem('currentWorkspace', JSON.stringify({
            id: company.id,
            name: company.name,
            type: 'enterprise'
          }));
          // Also save to AuthContext
          auth.setWorkspace(company.id, 'enterprise');
        }

        // Fetch permissions từ API
        if (permissionContext) {
          const userObj = JSON.parse(localStorage.getItem('user') || '{}');
          await permissionContext.fetchPermissions(userObj.id);
        }
        
        // Navigate to enterprise dashboard
        navigate(`/enterprise/${id}/statistics`);
      }
    } catch (error) {
      console.error('❌ Switch workspace error:', error);
      console.error('❌ Error response:', error?.response?.data);
      
      // Extract error message
      let errorMessage = 'Không thể chuyển đổi môi trường làm việc. Vui lòng thử lại.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      tax: '',
      fanpage: '',
      website: '',
      description: '',
      avatar: ''
    });
    setFormErrors({
      name: '',
      phone: '',
      email: '',
      tax: '',
      fanpage: '',
      website: '',
      avatar: ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setUploadingAvatar(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      tax: '',
      fanpage: '',
      website: '',
      description: '',
      avatar: ''
    });
    setFormErrors({
      name: '',
      phone: '',
      email: '',
      tax: '',
      fanpage: '',
      website: '',
      avatar: ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setUploadingAvatar(false);
  };

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateURL = (url) => {
    if (!url) return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    
    // Remove all non-digit characters except + for validation
    const cleaned = phone.replace(/\s+/g, '').trim();
    
    // Check if it's a valid Vietnamese phone number
    // Vietnamese phone numbers: 10 digits starting with 0
    // Common prefixes: 03, 05, 07, 08, 09, and some 02x
    
    // Pattern: 10 digits starting with 0, second digit should be 3, 5, 7, 8, or 9
    // Also accept 02x for Hanoi/Ho Chi Minh area codes
    const vnPattern = /^0[2-9][0-9]{8}$/;
    
    // Remove all non-digit characters
    const digitsOnly = cleaned.replace(/\D/g, '');
    
    // Check if it's +84 format and convert to 0 format
    if (cleaned.startsWith('+84')) {
      const withoutCountry = '0' + cleaned.replace(/\+84/, '');
      if (withoutCountry.length === 10) {
        return vnPattern.test(withoutCountry);
      }
    }
    
    // Check if it's exactly 10 digits starting with 0
    if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
      return vnPattern.test(digitsOnly);
    }
    
    return false;
  };

  // Normalize phone number to Vietnamese format (10 digits starting with 0)
  const normalizePhone = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // If starts with 84, replace with 0
    if (digitsOnly.startsWith('84') && digitsOnly.length === 11) {
      return '0' + digitsOnly.substring(2);
    }
    
    // If already starts with 0 and has 10 digits, return as is
    if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
      return digitsOnly;
    }
    
    // If has 9 digits, add 0 prefix
    if (digitsOnly.length === 9) {
      return '0' + digitsOnly;
    }
    
    // Return digits only (let backend handle validation)
    return digitsOnly;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Tên là bắt buộc';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0 (VD: 0123456789)';
      isValid = false;
    }

    if (formData.website && !validateURL(formData.website)) {
      errors.website = 'URL website không hợp lệ';
      isValid = false;
    }

    if (formData.fanpage && !validateURL(formData.fanpage)) {
      errors.fanpage = 'URL fanpage không hợp lệ';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({
        ...prev,
        avatar: 'Vui lòng chọn file ảnh'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({
        ...prev,
        avatar: 'Kích thước ảnh không được vượt quá 5MB'
      }));
      return;
    }

    // Clear error
    setFormErrors(prev => ({
      ...prev,
      avatar: ''
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Set file and upload
    setAvatarFile(file);
    setUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setFormData(prev => ({
          ...prev,
          avatar: uploadedUrl
        }));
        setSnackbar({
          open: true,
          message: 'Tải ảnh lên thành công!',
          severity: 'success'
        });
      } else {
        setFormErrors(prev => ({
          ...prev,
          avatar: 'Không thể tải ảnh lên. Vui lòng thử lại.'
        }));
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setFormErrors(prev => ({
        ...prev,
        avatar: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.'
      }));
      setAvatarFile(null);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
    setFormErrors(prev => ({
      ...prev,
      avatar: ''
    }));
    // Reset file input
    const fileInput = document.getElementById('avatar-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // Validate on change
    if (name === 'email' && value && !validateEmail(value)) {
      setFormErrors(prev => ({
        ...prev,
        email: 'Email không hợp lệ'
      }));
    } else if (name === 'website' && value && !validateURL(value)) {
      setFormErrors(prev => ({
        ...prev,
        website: 'URL không hợp lệ'
      }));
    } else if (name === 'fanpage' && value && !validateURL(value)) {
      setFormErrors(prev => ({
        ...prev,
        fanpage: 'URL không hợp lệ'
      }));
    } else if (name === 'phone' && value) {
      if (!validatePhone(value)) {
        setFormErrors(prev => ({
          ...prev,
          phone: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0 (VD: 0123456789)'
        }));
      }
    }
  };

  const handleSubmitDialog = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare form data with normalized phone number
      const submitData = {
        ...formData,
        phone: formData.phone ? normalizePhone(formData.phone) : formData.phone
      };
      
      if (dialogType === 'supplier') {
        // Call API to create new supplier
        const response = await supplierApi.createSupplier(submitData);
        
        setSnackbar({
          open: true,
          message: 'Tạo nhà cung cấp thành công!',
          severity: 'success'
        });
        
        // Reload suppliers list
        await fetchWorkspaces();
        
        handleCloseDialog();
      } else if (dialogType === 'company') {
        // Call API to create new enterprise
        const response = await enterpriseApi.createEnterprise(submitData);
        
        setSnackbar({
          open: true,
          message: 'Tạo doanh nghiệp thành công!',
          severity: 'success'
        });
        
        // Reload enterprises list
        await fetchWorkspaces();
        
        handleCloseDialog();
      }
    } catch (error) {
      console.error('❌ Create error:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error data:', error?.response?.data);
      
      // Extract error message from response and update form errors
      let errorMessage = `Không thể tạo ${dialogType === 'supplier' ? 'nhà cung cấp' : 'doanh nghiệp'}.`;
      const fieldErrors = {};
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle object with field-specific errors (e.g., {phone: 'Số điện thoại không hợp lệ (VN)'})
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          // Check if it's a validation error object with field names as keys
          Object.keys(errorData).forEach(key => {
            if (key === 'phone' || key === 'email' || key === 'name' || key === 'tax' || 
                key === 'website' || key === 'fanpage' || key === 'avatar') {
              fieldErrors[key] = errorData[key];
            }
          });
          
          // If we have field errors, set them in formErrors
          if (Object.keys(fieldErrors).length > 0) {
            setFormErrors(prev => ({
              ...prev,
              ...fieldErrors
            }));
            
            // Use first field error as main message
            errorMessage = Object.values(fieldErrors)[0];
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors array
          errorMessage = errorData.errors.map(e => e.message || e).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <PageWrapper>
        {/* Logo Section - 50% width on desktop */}
        <LogoSection>
          <LogoBox>
            <img
              src={EventMALogo}
              alt="EventMA Logo"
            />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                EventMA
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Nền tảng quản lý sự kiện
              </Typography>
            </Box>
          </LogoBox>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chọn không gian làm việc để bắt đầu
            </Typography>
          </Box>
        </LogoSection>

        {/* Content Section - 50% width on desktop */}
        <ContentSection>
          {/* Welcome message */}
          <Box sx={{ textAlign: 'center', mb: 3, px: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              Chào mừng bạn đến với
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              nền tảng Quản lý sự kiện EventMA
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                },
              }}
            >
              <Tab label="Doanh nghiệp" value="company" icon={<BusinessIcon sx={{ mr: 0.5 }} />} iconPosition="start" />
              <Tab label="Nhà cung cấp" value="supplier" icon={<StoreIcon sx={{ mr: 0.5 }} />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Fixed-height workspace container */}
          <WorkspaceGridContainer>
            {loading ? (
              <EmptyStateBox>
                <CircularProgress size={50} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Đang tải không gian làm việc...
                </Typography>
              </EmptyStateBox>
            ) : activeTab === 'company' && companies.length === 0 ? (
              <EmptyStateBox>
                <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Chưa có doanh nghiệp
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Hãy tạo doanh nghiệp mới để bắt đầu
                </Typography>
                <CreateButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('company')}
                >
                  Tạo doanh nghiệp
                </CreateButton>
              </EmptyStateBox>
            ) : activeTab === 'supplier' && suppliers.length === 0 ? (
              <EmptyStateBox>
                <StoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Chưa có nhà cung cấp
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Hãy tạo nhà cung cấp mới để bắt đầu
                </Typography>
                <CreateButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('supplier')}
                >
                  Tạo nhà cung cấp
                </CreateButton>
              </EmptyStateBox>
            ) : (
              <>
                {/* Display only selected tab items with lazy loading */}
                {activeTab === 'company' ? (
                  companies.map((company) => (
                    <LazyWorkspaceCard
                      key={company.id}
                      workspace={company}
                      type="company"
                      userId={userId}
                      onSelect={handleSelectWorkspace}
                      theme={theme}
                    />
                  ))
                ) : (
                  suppliers.map((supplier) => (
                    <LazyWorkspaceCard
                      key={supplier.id}
                      workspace={supplier}
                      type="supplier"
                      userId={userId}
                      onSelect={handleSelectWorkspace}
                      theme={theme}
                    />
                  ))
                )}
              </>
            )}
          </WorkspaceGridContainer>

          {/* Create Button */}
          {!loading && ((activeTab === 'company' && companies.length > 0) || (activeTab === 'supplier' && suppliers.length > 0)) && (
            <Box sx={{ mt: 3, width: '100%' }}>
              <CreateButton
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog(activeTab)}
              >
                Thêm {activeTab === 'company' ? 'doanh nghiệp' : 'nhà cung cấp'}
              </CreateButton>
            </Box>
          )}
        </ContentSection>
      </PageWrapper>
      
      {/* Dialog for creating new supplier/company */}
      <StyledDialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            background: dialogType === 'supplier' 
              ? `linear-gradient(135deg, ${theme.palette.primary.main}08, transparent)`
              : `linear-gradient(135deg, ${theme.palette.secondary.main}08, transparent)`,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              backgroundColor: dialogType === 'supplier' ? 'primary.light' : 'secondary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {dialogType === 'supplier' ? (
              <StoreIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            ) : (
              <BusinessIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
            )}
          </Box>
          Tạo {dialogType === 'supplier' ? 'nhà cung cấp' : 'doanh nghiệp'} mới
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Tên */}
            <FormControl fullWidth>
              <FormLabel htmlFor="name" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Tên <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <TextField
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder={dialogType === 'supplier' ? 'Nhập tên nhà cung cấp' : 'Nhập tên doanh nghiệp'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon 
                        sx={{ 
                          color: formErrors.name ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                  }
                }}
              />
            </FormControl>

            {/* Email */}
            <FormControl fullWidth>
              <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Email <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <TextField
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                type="email"
                required
                error={!!formErrors.email}
                helperText={formErrors.email || 'Email sẽ được sử dụng để liên hệ'}
                placeholder="example@email.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon 
                        sx={{ 
                          color: formErrors.email ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                  }
                }}
              />
            </FormControl>

            {/* Số điện thoại */}
            <FormControl fullWidth>
              <FormLabel htmlFor="phone" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Số điện thoại
              </FormLabel>
              <TextField
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.phone}
                helperText={formErrors.phone || 'Nhập số điện thoại 10 số bắt đầu bằng 0 (VD: 0123456789)'}
                placeholder="0123456789"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon 
                        sx={{ 
                          color: formErrors.phone ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                  }
                }}
              />
            </FormControl>

            {/* Mã số thuế */}
            <FormControl fullWidth>
              <FormLabel htmlFor="tax" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Mã số thuế
              </FormLabel>
              <TextField
                id="tax"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Nhập mã số thuế (tùy chọn)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon 
                        sx={{ 
                          color: 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                  }
                }}
              />
            </FormControl>

            {/* Website */}
            <FormControl fullWidth>
              <FormLabel htmlFor="website" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Website
              </FormLabel>
              <TextField
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.website}
                helperText={formErrors.website || 'URL website của bạn (tùy chọn)'}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon 
                        sx={{ 
                          color: formErrors.website ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                  }
                }}
              />
            </FormControl>

            {/* Fanpage */}
            <FormControl fullWidth>
              <FormLabel htmlFor="fanpage" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Fanpage Facebook
              </FormLabel>
              <TextField
                id="fanpage"
                name="fanpage"
                value={formData.fanpage}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.fanpage}
                helperText={formErrors.fanpage || 'URL fanpage Facebook (tùy chọn)'}
                placeholder="https://facebook.com/yourpage"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon 
                        sx={{ 
                          color: formErrors.fanpage ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                  }
                }}
              />
            </FormControl>

            {/* Mô tả */}
            <FormControl fullWidth>
              <FormLabel htmlFor="description" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Mô tả
              </FormLabel>
              <TextField
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                placeholder="Nhập mô tả về nhà cung cấp/doanh nghiệp của bạn (tùy chọn)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', pt: 1.5 }}>
                      <DescriptionIcon 
                        sx={{ 
                          color: 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                    },
                  },
                  '& .MuiInputBase-input': {
                    paddingLeft: theme.spacing(1),
                    paddingTop: theme.spacing(1.5),
                  }
                }}
              />
            </FormControl>

            {/* Avatar Upload */}
            <FormControl fullWidth>
              <FormLabel htmlFor="avatar" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Ảnh đại diện
              </FormLabel>
              
              {avatarPreview ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 200,
                      mx: 'auto',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: 2,
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                    {uploadingAvatar && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CircularProgress size={40} sx={{ color: 'white' }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={uploadingAvatar}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Chọn ảnh khác
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Xóa ảnh
                    </Button>
                  </Box>
                  {formErrors.avatar && (
                    <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
                      {formErrors.avatar}
                    </Typography>
                  )}
                  {formData.avatar && !uploadingAvatar && (
                    <Typography variant="caption" color="success.main" sx={{ textAlign: 'center' }}>
                      ✓ Đã tải ảnh lên thành công
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={uploadingAvatar ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                    disabled={uploadingAvatar}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: formErrors.avatar ? 'error.main' : 'divider',
                      backgroundColor: 'action.hover',
                      '&:hover': {
                        borderColor: formErrors.avatar ? 'error.main' : 'primary.main',
                        backgroundColor: 'action.selected',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                      },
                    }}
                  >
                    {uploadingAvatar ? 'Đang tải lên...' : 'Chọn ảnh từ thiết bị'}
                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </Button>
                  {formErrors.avatar && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {formErrors.avatar}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Chọn ảnh đại diện (JPG, PNG, tối đa 5MB)
                  </Typography>
                </Box>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={handleCloseDialog}
            size="large"
            disabled={submitting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              minWidth: 100,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitDialog}
            variant="contained"
            size="large"
            disabled={
              !formData.name.trim() || 
              !formData.email.trim() || 
              !!formErrors.name || 
              !!formErrors.email || 
              !!formErrors.phone || 
              !!formErrors.website || 
              !!formErrors.fanpage || 
              !!formErrors.avatar ||
              uploadingAvatar ||
              submitting
            }
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            color={dialogType === 'supplier' ? 'primary' : 'secondary'}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              minWidth: 140,
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {submitting ? 'Đang tạo...' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </StyledDialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
