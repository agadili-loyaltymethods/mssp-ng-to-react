import { useCallback } from 'react';
import axios from 'axios';
import { Location } from '../types';
import { getAppConfig } from '@/services/configService';
import { useApiClient } from './useApiClientService';

export const useLocationService = () => {
  const { config } = getAppConfig();
  const { getCall } = useApiClient();
  
  const getLocations = useCallback(async (sort?: string | number): Promise<Location[]> => {
    try {
      let url = `${config.REST_URL}/api/v1/locations`;
      if (sort !== undefined) {
        url += `&sort=${sort}`;
      }
      
      const response = await getCall(url);
      const data = Array.isArray(response) ? response : [response];
      
      // Sort locations by name
      return data.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }, [config]);
  
  return {
    getLocations,
  };
};
