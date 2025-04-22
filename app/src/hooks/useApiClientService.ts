import { useState, useCallback } from 'react';
import { handleError } from '../utils/errorHandler';
import { AuthHelper } from '@/utils/authHelper';
import { getAppConfig } from '@/services/configService';
import useAlertService from './useAlertService';
import { MemberInfo } from '@/models/member-info';

interface ApiState {
    loading: boolean;
    error: Error | null;
}

interface ApiError {
    message: string;
    status?: number;
}

export const useApiClient = () => {
    const [state, setState] = useState<ApiState>({
        loading: false,
        error: null
    });
    const { config } = getAppConfig();
    const { errorAlert } = useAlertService();

    const request = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            let token = AuthHelper.getToken();
            const url = `${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            };

            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401 || response.statusText === 'Forbidden') {
                AuthHelper.removeToken();
                try {
                    //const newToken = await login({username: 'demo/agadili',password:'Abhi1315*'});
                    const newToken = await loginMember({ username: 'demo/vgunasekaran', password: 'Password1' });
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: {
                            ...headers,
                            'Authorization': `Bearer ${newToken}`,
                        },
                    });

                    if (!retryResponse.ok) {
                        const error: ApiError = {
                            message: 'Authentication failed',
                            status: retryResponse.status,
                        };
                        throw error;
                    }
                    setState(prev => ({ ...prev, loading: false }));
                    return retryResponse.json();
                } catch (retryError) {
                    console.error('Token refresh failed:', retryError);
                    const error: ApiError = {
                        message: 'Session expired. Please refresh the page and try again.',
                        status: 401,
                    };
                    handleError(error);
                    setState(prev => ({ ...prev, loading: false, error: retryError as Error }));
                    throw retryError;
                }
            }

            if (response.status === 204) {
                setState(prev => ({ ...prev, loading: false }));
                return null;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: 'An unexpected error occurred',
                    status: response.status
                }));
                handleError(error);
                setState(prev => ({ ...prev, loading: false, error: error as Error }));
                throw error;
            }

            const data = await response.json();
            setState(prev => ({ ...prev, loading: false }));
            return data;
        } catch (error) {
            console.error('API request error:', error);
            handleError(error);
            setState(prev => ({ ...prev, loading: false, error: error as Error }));
            throw error;
        }
    }, []);

    const loginMember = useCallback(async (credentials: { username: string; password: string }): Promise<MemberInfo> => {
        try {
            const response = await postCall(`${config.REST_URL}/api/v1/login`, credentials);

            if (!response?.token) {
                throw new Error('Login failed');
            }

            AuthHelper.setToken(response?.token);

            return response?.token;
        } catch (error: any) {
            errorAlert(error?.error?.error || error?.message);
            throw error;
        }
    }, [config, errorAlert]);

    const getCall = useCallback((endpoint: string, options = {}) => {
        return request(endpoint, { ...options, method: 'GET' });
    }, [request]);

    const postCall = useCallback((endpoint: string, data: any, options = {}) => {
        return request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }, [request]);

    const putCall = useCallback((endpoint: string, data: any, options = {}) => {
        return request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }, [request]);

    const deleteCall = useCallback((endpoint: string, options = {}) => {
        return request(endpoint, { ...options, method: 'DELETE' });
    }, [request]);

    return {
        getCall,
        postCall,
        putCall,
        deleteCall,
        loading: state.loading,
        error: state.error,
        reset: useCallback(() => setState({ loading: false, error: null }), [])
    };
};