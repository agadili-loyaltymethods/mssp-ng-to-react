import { useCallback } from 'react';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { Member, ActivityHistory } from '../types';
import useAlertService from './useAlertService';
import { useApiClient } from './useApiClientService';
import { getAppConfig } from '@/services/configService';

export const useMemberService = () => {
  const { config } = getAppConfig();
  const { errorAlert } = useAlertService();
  const { getCall, postCall } = useApiClient();
  
  // Create subjects to mimic Angular's BehaviorSubject
  const refreshMemberSubject = new BehaviorSubject<void>(undefined);
  const isFetchingSubject = new BehaviorSubject<boolean>(false);

  const refreshMember = useCallback(() => {
    refreshMemberSubject.next();
  }, []);

  const updateFetchingStatus = useCallback((status: boolean = false) => {
    isFetchingSubject.next(status);
  }, []);

  const getMember = useCallback(async (loyaltyId: string = '1001'): Promise<Member> => {
    try {
      const url = `${config.REST_URL}/api/v1/members/${loyaltyId}/profile?linked=true&divide=true`;
      const response: any = await getCall(url, { params: { query: true } });
      
      return {
        ...response?.[0].member,
        loyaltyId,
      };
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getPromo = useCallback(async (id: string, locationNum: string) => {
    try {
      const url = `${config.REST_URL}/api/v1/members/${id}/rules?filter=promo${locationNum ? `&stores=${locationNum}` : ''}`;
      const response = await getCall(url);
      return response;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getOffers = useCallback(async (id: string, locationNum: string) => {
    try {
      const url = `${config.REST_URL}/api/v1/members/${id}/offers?filter=offers,global${locationNum ? `&stores=${locationNum}` : ''}`;
      const response = await getCall(url);
      return response;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getVouchers = useCallback(async (member: Member) => {
    if (!member) {
      throw new Error('Member data is required');
    }

    try {
      const url = `${config.REST_URL}/api/v1/rewardpolicies`;

      const currentTier = member.tiers?.find((tier: any) => tier.primary);
      if (!currentTier) {
        throw new Error('No primary tier found for the member');
      }

      const query = {
        intendedUse: "Reward",
        $or: [
          { tierPolicyLevels: { $exists: false } },
          { tierPolicyLevels: { $size: 0 } },
          {
            tierPolicyLevels: {
              $elemMatch: {
                policyId: currentTier.policyId,
                level: currentTier.level.name
              }
            }
          }
        ]
      };

      const finalUrl = `${url}?query=${encodeURIComponent(JSON.stringify(query))}`;
      const response = await getCall(finalUrl);
      return response;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const buyVoucher = useCallback(async (payload: any) => {
    try {
      const url = `${config.REST_URL}/api/v1/buy`;
      const response = await postCall(url, payload);
      return response.data;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getMemberVouchers = useCallback(async (id: string) => {
    try {
      const url = `${config.REST_URL}/api/v1/members/${id}/offers?filter=rewards`;
      const response = await getCall(url);
      return response;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getActivityHistory = useCallback(async (memberId: string): Promise<ActivityHistory[]> => {
    try {
      const url = `${config.RC_REST_URL}/api/v1/activityhistories?query=${JSON.stringify({ memberID: memberId })}`;
      const response = await getCall(url);
      return response;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getStreaks = useCallback(async (id: string) => {
    try {
      const url = `${config.REST_URL}/api/v1/streaks`;
      const response = await getCall(url, { params: { query: id } });
      return response;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  const getAggregate = useCallback(async ({ week, year, metricName }: { week: number, year: number, metricName: string }) => {
    try {
      const url = `${config.REST_URL}/api/v1/aggregate`;
      const response = await postCall(url, { 
        params: { week, year, metricName } 
      });
      return response.data;
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
      throw error;
    }
  }, [config, errorAlert]);

  return {
    refreshMember$: {
      subscribe: (callback: () => void) => {
        const subscription = refreshMemberSubject.subscribe(callback);
        return {
          unsubscribe: () => subscription.unsubscribe()
        };
      }
    },
    isFetching$: {
      subscribe: (callback: (value: boolean) => void) => {
        const subscription = isFetchingSubject.subscribe(callback);
        return {
          unsubscribe: () => subscription.unsubscribe()
        };
      }
    },
    refreshMember,
    updateFetchingStatus,
    getMember,
    getPromo,
    getOffers,
    getVouchers,
    buyVoucher,
    getMemberVouchers,
    getActivityHistory,
    getStreaks,
    getAggregate
  };
};
