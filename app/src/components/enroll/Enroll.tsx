import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { useLoginService } from '../../hooks/useLoginService';
import { useAlertService } from '../../hooks/useAlertService';

export const Enroll: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const loginService = useLoginService();
  const alertService = useAlertService();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await loginService.enroll(formData);
      if (response.status === 'success') {
        alertService.successAlert('Enrollment successful. Please proceed to log in.');
        navigate('/login', { 
          state: { email: btoa(formData.email) }
        });
      }
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-[70%] bg-[url('/assets/login-banner.jpg')] bg-cover bg-bottom" />
      <div className="flex-[30%] flex flex-col items-center">
        <div className="flex justify-center mt-25 mb-12">
          <img src="/assets/logo-login.svg" alt="Logo" width="250" />
        </div>
        
        <div className="w-[80%]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
              />
            </div>
            
            {/* Additional form fields */}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              className="enroll-btn mt-2.5 mb-2.5 p-6"
            >
              {isLoading ? <CircularProgress size={24} /> : 'CREATE AN ACCOUNT'}
            </Button>
          </form>

          <div className="flex items-center gap-2.5 mt-2.5 mb-2.5">
            <Divider className="w-[25%]" />
            <p className="text-gray-500">Already a Member?</p>
            <Divider className="w-[25%]" />
          </div>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            className="mt-2.5 mb-2.5 p-6 stroked-btn"
            onClick={() => navigate('/login')}
          >
            SIGN IN
          </Button>
        </div>
      </div>
    </div>
  );
};