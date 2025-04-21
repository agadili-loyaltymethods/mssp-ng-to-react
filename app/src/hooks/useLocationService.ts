import { useCallback } from 'react';
import axios from 'axios';
import { useAppConfig } from '../contexts/AppConfigContext';
import { Location } from '../types';

export const useLocationService = () => {
  const { config } = useAppConfig();
  
  const getLocations = useCallback(async (sort?: string | number): Promise<Location[]> => {
    try {
      let url = `${config.config.REST_URL}/api/v1/locations`;
      if (sort !== undefined) {
        url += `&sort=${sort}`;
      }
      
      const response = await axios.get<Location[]>(url);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      
      // Sort locations by name
      return data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }, [config]);
  
  return {
    getLocations,
  };
};
