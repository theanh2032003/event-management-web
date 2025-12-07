import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
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
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import theme from '../../../theme';
import authApi from '../api/auth.api';
import { useToast } from '../../../app/providers/ToastContext';
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

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const toast = useToast();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [retypePasswordError, setRetypePasswordError] = React.useState(false);
  const [retypePasswordErrorMessage, setRetypePasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRetypePassword, setShowRetypePassword] = React.useState(false);

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const retypePassword = document.getElementById('retypePassword');
    const name = document.getElementById('name');

    let isValid = true;

    if (!name.value || name.value.trim().length < 1) {
      setNameError(true);
      setNameErrorMessage('Vui lòng nhập họ tên.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!retypePassword.value) {
      setRetypePasswordError(true);
      setRetypePasswordErrorMessage('Vui lòng nhập lại mật khẩu.');
      isValid = false;
    } else if (password.value !== retypePassword.value) {
      setRetypePasswordError(true);
      setRetypePasswordErrorMessage('Mật khẩu nhập lại không khớp.');
      isValid = false;
    } else {
      setRetypePasswordError(false);
      setRetypePasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate all inputs first
    if (!validateInputs()) {
      return;
    }
    
    setIsLoading(true);
    
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const retypePassword = data.get('retypePassword');
    
    // Double check password match
    if (password !== retypePassword) {
      setRetypePasswordError(true);
      setRetypePasswordErrorMessage('Mật khẩu nhập lại không khớp.');
      setIsLoading(false);
      return;
    }
    
    const userData = {
      name: data.get('name'),
      email: email,
      password: password,
      retypePassword: retypePassword,
    };
    
    try {
      const response = await authApi.register(userData);
      
      // Show success toast and navigate to email verification page
      toast.success('Đăng ký thành công!');
      navigate('/verify-email', {
        state: {
          email: email,
          message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (error.response.status === 400 || error.response.status === 409) {
          if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('đã tồn tại')) {
            setEmailError(true);
            setEmailErrorMessage('Email đã tồn tại');
          } else {
            toast.error(errorMessage);
            setEmailError(true);
            setEmailErrorMessage(errorMessage);
          }
        } else if (error.response.status === 500) {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } else {
          toast.error(errorMessage);
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.');
      } else {
        toast.error('Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowRetypePassword = () => {
    setShowRetypePassword(!showRetypePassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSignIn = () => {
    navigate('/signin');
  };
 

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
      <SignUpContainer direction="column" justifyContent="center">
       <Card variant="outlined">
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
             Đăng ký
           </Typography>
           <Typography
             variant="body2"
             sx={{ 
               color: 'text.secondary',
               fontSize: '0.9375rem',
               fontWeight: 400,
             }}
           >
             Tạo tài khoản mới để bắt đầu
           </Typography>
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
              <FormLabel htmlFor="name" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Họ tên
              </FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Nhập họ tên của bạn"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? 'error' : 'primary'}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon 
                        sx={{ 
                          color: nameError ? 'error.main' : 'action.active',
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
              <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Email
              </FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                type="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
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
                required
                fullWidth
                name="password"
                placeholder="Nhập mật khẩu"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
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
            <FormControl fullWidth>
              <FormLabel htmlFor="retypePassword" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Nhập lại mật khẩu
              </FormLabel>
              <TextField
                required
                fullWidth
                name="retypePassword"
                placeholder="Nhập lại mật khẩu"
                type={showRetypePassword ? 'text' : 'password'}
                id="retypePassword"
                autoComplete="new-password"
                variant="outlined"
                error={retypePasswordError}
                helperText={retypePasswordErrorMessage}
                color={retypePasswordError ? 'error' : 'primary'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        sx={{ 
                          color: retypePasswordError ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle retype password visibility"
                        onClick={handleClickShowRetypePassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{
                          color: 'action.active',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        {showRetypePassword ? <VisibilityOff /> : <Visibility />}
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
           
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: theme.spacing(1),
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
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
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
              Bạn có tài khoản rồi?{' '}
              <Link
                onClick={handleSignIn}
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
                component="button"
                type="button"
              >
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  );
}
