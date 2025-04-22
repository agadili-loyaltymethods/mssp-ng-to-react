import { useCallback } from 'react';
import axios from 'axios';
import { Coupon } from '../types';
import { getAppConfig } from '@/services/configService';
import { useApiClient } from './useApiClientService';

export const useActivityService = () => {
  const { config } = getAppConfig();
  const { getCall, postCall } = useApiClient();

  const getActivity = useCallback(async (payload: any, persist = false) => {
    const defaultValues = {
      srcChannelType: 'Web',
      loyaltyID: localStorage.getItem('loyaltyId')
    };

    const url = `${config.REST_URL}/api/v1/activity?filter=data,error?persist=${persist}`;

    if (Array.isArray(payload)) {
      // Handling multiple activities
      const requests = payload.map(item =>
        postCall(url, { ...item, ...defaultValues })
      );
      return Promise.all(requests);
    } else {
      // Single activity request
      return postCall(url, { ...payload, ...defaultValues });
    }
  }, [config]);

  const getStreakPolicy = useCallback(async () => {
    const url = `${config.REST_URL}/api/v1/streakPolicies?select=name,description,goalPolicies,timeLimit,ext`;
    return getCall(url);
  }, [config]);

  const getPerks = useCallback(async () => {
    return getCall(`${config.REST_URL}/api/v1/rewardPolicy`);
  }, [config]);

  const getCoupons = useCallback(async (): Promise<Coupon[]> => {
    const response: any = await getCall(`${config.REST_URL}/api/v1/rewardPolicies`);
    return response.data;
  }, [config]);

  const getCouponList = useCallback(async (id: string) => {
    return getCall(`${config.REST_URL}/api/v1/rewards`, { params: { query: id } });
  }, [config]);

  return {
    getActivity,
    getStreakPolicy,
    getPerks,
    getCoupons,
    getCouponList
  };
};
