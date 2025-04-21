import { useCallback } from 'react';
import axios from 'axios';
import { useAppConfig } from '../contexts/AppConfigContext';
import { Coupon } from '../types';

export const useActivityService = () => {
  const { config } = useAppConfig();

  const getActivity = useCallback(async (payload: any, persist = false) => {
    const defaultValues = {
      srcChannelType: 'Web',
      loyaltyID: localStorage.getItem('loyaltyId')
    };

    const url = `${config.config.REST_URL}/api/v1/activity?filter=data,error?persist=${persist}`;

    if (Array.isArray(payload)) {
      // Handling multiple activities
      const requests = payload.map(item =>
        axios.post(url, { ...item, ...defaultValues })
      );
      return Promise.all(requests);
    } else {
      // Single activity request
      return axios.post(url, { ...payload, ...defaultValues });
    }
  }, [config]);

  const getStreakPolicy = useCallback(async () => {
    const url = `${config.config.REST_URL}/api/v1/streakPolicies?select=name,description,goalPolicies,timeLimit,ext`;
    return axios.get(url);
  }, [config]);

  const getPerks = useCallback(async () => {
    return axios.get(`${config.config.REST_URL}/api/v1/rewardPolicy`);
  }, [config]);

  const getCoupons = useCallback(async (): Promise<Coupon[]> => {
    const response = await axios.get(`${config.config.REST_URL}/api/v1/rewardPolicies`);
    return response.data;
  }, [config]);

  const getCouponList = useCallback(async (id: string) => {
    return axios.get(`${config.config.REST_URL}/api/v1/rewards`, { params: { query: id } });
  }, [config]);

  return {
    getActivity,
    getStreakPolicy,
    getPerks,
    getCoupons,
    getCouponList
  };
};
