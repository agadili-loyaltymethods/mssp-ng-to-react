
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Divider,
  CircularProgress,
  Box
} from '@mui/material';
import { useLoginService } from '../../hooks/useLoginService';
import useAlertService from '@/hooks/useAlertService';

interface LoginForm {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const loginService = useLoginService();
  const alertService = useAlertService();

  useEffect(() => {
    localStorage.clear();
    
    // Handle email from query params
    const params = new URLSearchParams(location.search);
    const encodedEmail = params.get('email');
    if (encodedEmail) {
      setFormData(prev => ({
        ...prev,
        username: atob(encodedEmail)
      }));
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: Partial<LoginForm> = {};
    
    if (!formData.username) {
      newErrors.username = 'Email is required!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await loginService.login(formData);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('idToken', response.idToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      navigate('/dashboard');
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-[70%] bg-[url('/assets/login-banner.jpg')] bg-cover bg-bottom">
        <h1 className="text-5xl">Welcome to BCLC</h1>
      </div>
      
      <div className="flex-[30%] flex flex-col items-center">
        <div className="flex justify-center mt-25 mb-12">
          <img src="/assets/logo-login.svg" alt="Logo" width="250" />
        </div>
        
        <div className="flex flex-row justify-center w-full">
          <div className="flex flex-col justify-center w-4/5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField
                label="Email"
                name="username"
                type="email"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                disabled={isLoading}
                fullWidth
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isLoading}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                className="signin-btn mt-2.5 mb-2.5 p-6"
              >
                {isLoading ? <CircularProgress size={24} /> : 'SIGN IN'}
              </Button>
            </form>

            <div className="flex items-center gap-2.5 mt-2.5 mb-2.5">
              <Divider className="w-1/4" />
              <p className="text-gray-500">Not a Member?</p>
              <Divider className="w-1/4" />
            </div>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              className="mt-2.5 mb-2.5 p-6 stroked-btn"
              onClick={() => navigate('/enroll')}
            >
              CREATE AN ACCOUNT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
