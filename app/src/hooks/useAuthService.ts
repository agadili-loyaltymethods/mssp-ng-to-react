import { useCallback, useState } from 'react';
import { TypedUseSelectorHook, useDispatch } from 'react-redux';
import { setAuthenticated, setUnauthenticated } from '../redux/slices/authSlice';
import { AuthHelper } from '../utils/authHelper';
import { AppDispatch, RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAuthService = () => {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(AuthHelper.isAuthenticated());

  const updateAuthStatus = useCallback(() => {
    const authStatus = AuthHelper.isAuthenticated();
    setIsAuthenticatedState(authStatus);
    return authStatus;
  }, []);

  const login = useCallback((token: string) => {
    AuthHelper.setToken(token);
    dispatch(setAuthenticated({ token }));
    updateAuthStatus();
  }, [dispatch, updateAuthStatus]);

  const logout = useCallback(() => {
    AuthHelper.removeToken();
    dispatch(setUnauthenticated());
    updateAuthStatus();
  }, [dispatch, updateAuthStatus]);

  return {
    isAuthenticated$: { subscribe: (callback: (value: boolean) => void) => callback(isAuthenticated) },
    updateAuthStatus,
    login,
    logout
  };
};
