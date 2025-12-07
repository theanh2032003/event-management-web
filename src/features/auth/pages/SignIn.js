import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import theme from '../../../theme';
import authApi from '../api/auth.api';
import { useToast } from '../../../app/providers/ToastContext';
import { useAuth } from '../../../app/providers/AuthContext';
import EventMALogo from '../../../assets/images/EventMAlogo.png';
import BackGround from '../../../assets/images/BackGround.png';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2.5),
  margin: 'auto',
  borderRadius: theme.spacing(3),
  backgroundColor: 'background.paper',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    'hsla(220, 30%, 5%, 0.1) 0px 10px 30px 0px, hsla(220, 25%, 10%, 0.1) 0px 20px 60px -10px',
  [theme.breakpoints.up('xs')]: {
    width: '95%',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
  },
  [theme.breakpoints.up('sm')]: {
    width: '90%',
    maxWidth: '450px',
    padding: theme.spacing(3.5),
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.up('md')]: {
    width: '85%',
    maxWidth: '500px',
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    width: '80%',
    maxWidth: '520px',
    padding: theme.spacing(4.5),
    gap: theme.spacing(3),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      'hsla(220, 30%, 5%, 0.7) 0px 10px 30px 0px, hsla(220, 25%, 10%, 0.15) 0px 20px 60px -10px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(1),
  position: 'relative',
  [theme.breakpoints.up('xs')]: {
    padding: theme.spacing(0.5),
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(3),
  },
}));

export default function SignIn(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const toast = useToast();
  const auth = useAuth();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  
  // Get success message from location state
  const successMessage = location.state?.message;

  // Load saved email from localStorage on component mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.value = savedEmail;
        setRememberMe(true);
      }
    }
  }, []);

  // Show success toast if there's a message from location state
  // React.useEffect(() => {
  //   if (successMessage) {
  //     toast.success(successMessage);
  //   }
  // }, [successMessage, toast]);

  const handleSubmit = async (event) => {
    if (emailError || passwordError) {
      event.preventDefault();
      return;
    }
    
    event.preventDefault();
    setIsLoading(true);
    
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const loginData = {
      email: email,
      password: password,
    };
    
    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    try {
      const response = await authApi.login(loginData);
      

      
      // Save tokens to localStorage
      if (response.accessToken) {
        // Extract user info from JWT token
        try {
          // Decode JWT token (base64 decode the payload)
          const tokenParts = response.accessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Extract user info from JWT
            const userId = payload['user-id'] || payload.userId || payload.id || payload.sub;
            const userName = payload['user-name'] || payload.userName || payload.name;
            const userEmail = payload['user-email'] || payload.userEmail || payload.email;
            
     
            
            if (userId) {
              // Create user object from JWT data
              const user = {
                id: userId,
                name: userName,
                email: userEmail
              };
              
              // Use auth.login() from AuthContext to save token and user
              auth.login(response.accessToken, user);
              
              // Also save refreshToken
              localStorage.setItem('refreshToken', response.refreshToken);
              
              // Navigate to select workspace page after successful login
              navigate('/select-workspace');
            } else {
              setEmailError(true);
              setEmailErrorMessage('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
              return;
            }
          }
        } catch (jwtError) {
          // Continue anyway, maybe backend will add user object later
          console.error('JWT decode error:', jwtError);
        }
        
      } else {
        // Handle case where token is not returned
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (error.response.status === 401) {
          setPasswordError(true);
          setPasswordErrorMessage('Sai mật khẩu');
        } else if (error.response.status === 404) {
          setEmailError(true);
          setEmailErrorMessage('Tài khoản không tồn tại');
        } else if (error.response.status === 500) {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } else {
          toast.error(errorMessage);
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.');
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSignup = ()=>{
    navigate('/signup');
  }

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundImage: `url(${BackGround})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: theme.palette.mode === 'dark' ? 0.2 : 0.3,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))'
              : 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
          },
        }}
      />
      <SignInContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          {successMessage && (
            <Alert severity="success" sx={{ mb: theme.spacing(1.5) }}>
              {successMessage}
            </Alert>
          )}
          <Box sx={{ textAlign: 'center', mb: theme.spacing(4) }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: theme.spacing(3),
            }}>
              <img 
                src={EventMALogo} 
                alt="EventMA Logo" 
                style={{
                  height: 'auto',
                  maxWidth: '100px',
                  width: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ 
                width: '100%', 
                fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', 
                mb: theme.spacing(1),
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              Đăng nhập
            </Typography>
            {/* <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9375rem',
                fontWeight: 400,
              }}
            >
              Chào mừng bạn trở lại
            </Typography> */}
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: theme.spacing(2),
            }}
          >
            <FormControl fullWidth>
              <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Email
              </FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon 
                        sx={{ 
                          color: emailError ? 'error.main' : 'action.active',
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
            <FormControl fullWidth>
              <FormLabel htmlFor="password" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Mật khẩu
              </FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="Nhập mật khẩu"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        sx={{ 
                          color: passwordError ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{
                          color: 'action.active',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
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
                    paddingRight: theme.spacing(0.5),
                  }
                }}
              />
            </FormControl>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: -0.5,
              mb: 0.5
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    color="primary"
                    sx={{
                      '& .MuiSvgIcon-root': {
                        fontSize: 20,
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 400 }}>
                    Ghi nhớ đăng nhập
                  </Typography>
                }
              />
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/forgot-password')}
                variant="body2"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Quên mật khẩu?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
              disabled={isLoading}
              sx={{
                mt: theme.spacing(2),
                py: theme.spacing(1.75),
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0px 4px 14px rgba(25, 118, 210, 0.4)',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  boxShadow: '0px 6px 20px rgba(25, 118, 210, 0.5)',
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                '&:disabled': {
                  boxShadow: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  opacity: 0.6,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: theme.spacing(3),
              pt: theme.spacing(3),
              pb: theme.spacing(1),
              borderTop: `1px solid ${theme.palette.divider}`,
              width: '100%',
            }}
          >
            <Typography sx={{ 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: 'text.secondary', 
              width: '100%',
              py: theme.spacing(0.5),
            }}>
              Chưa có tài khoản?{' '}
              <Link
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  verticalAlign: 'baseline',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
                type="button"
                onClick={handleSignup}
                component="button"
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </>
  );
}
