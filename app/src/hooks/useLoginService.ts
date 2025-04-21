import { useCallback } from 'react';
import axios from 'axios';
import { useAppConfig } from '../contexts/AppConfigContext';
import { useDispatch } from 'react-redux';
import { addMember } from '../redux/slices/memberSlice';
import { useAlertService } from './useAlertService';
import { useMemberService } from './useMemberService';
import { AuthHelper } from '../utils/authHelper';
import { MemberInfo } from '../types';

export const useLoginService = () => {
  const { config } = useAppConfig();
  const dispatch = useDispatch();
  const { errorAlert } = useAlertService();
  const { getMember } = useMemberService();
  
  let pendingLoginRequest: Promise<string> | null = null;

  const login = useCallback(async (credentials: { username: string; password: string }): Promise<MemberInfo> => {
    try {
      const response = await axios.post<MemberInfo>(`${config.config.REST_URL}/api/v1/login`, credentials);
      
      if (!response?.data?.accessToken) {
        throw new Error('Login failed');
      }
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('idToken', response.data.idToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getToken = useCallback(async (): Promise<string> => {
    if (pendingLoginRequest) {
      return pendingLoginRequest;
    }

    pendingLoginRequest = (async () => {
      try {
        const token = AuthHelper.getToken();
        if (token) {
          return token;
        }

        const response = await axios.post<{ token: string }>(`${config.config.REST_URL}/api/v1/login`, {
          username: 'demo/vgunasekaran',
          password: 'Password1',
        });

        if (!response?.data?.token) {
          throw new Error('Login failed');
        }

        AuthHelper.setToken(response.data.token);

        // Call the member API and store the member
        try {
          const member = await getMember();
          dispatch(addMember({ member }));
          localStorage.setItem('loyaltyId', member.loyaltyId);
        } catch (error: any) {
          errorAlert(error?.error?.error || error?.message);
        }

        return response.data.token;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        pendingLoginRequest = null;
      }
    })();

    return pendingLoginRequest;
  }, [config, dispatch, errorAlert, getMember]);

  const enroll = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await axios.post(`${config.config.REST_URL}/api/v1/enroll`, userData);
      return response.data;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const ensureAuthenticated = useCallback(async (): Promise<string> => {
    let token = AuthHelper.getToken();
    if (!token) {
      token = await getToken();
    }
    return token ?? '';
  }, [getToken]);

  return {
    login,
    getToken,
    enroll,
    ensureAuthenticated
  };
};
