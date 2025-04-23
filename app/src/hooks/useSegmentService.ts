import { useCallback } from 'react';
import axios from 'axios';
import { Segment } from '../types';
import { getAppConfig } from '@/services/configService';
import { useApiClient } from './useApiClientService';

export const useSegmentService = () => {
  const { config } = getAppConfig();
  const { getCall, postCall, deleteCall } = useApiClient();
  
  const getAllSegments = useCallback(async (query: string = '', limit: number = 10): Promise<Segment[]> => {
    try {
      const response = await getCall(
        `${config.REST_URL}/api/v1/segments?limit=${limit}&query=${query}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching segments:', error);
      throw error;
    }
  }, [config]);
  
  const getMemberSegments = useCallback(async (limit: number = 10, query: string) => {
    try {
      const response = await getCall(
        `${config.REST_URL}/api/v1/membersegments?limit=${limit}&query=${query}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching member segments:', error);
      throw error;
    }
  }, [config]);
  
  const addMemberSegment = useCallback(async (memberId: string, segmentId: string) => {
    try {
      const payload = {
        member: memberId,
        segment: segmentId,
        ext: {}
      };
      
      const response = await postCall(
        `${config.REST_URL}/api/v1/membersegments`, 
        payload
      );
      
      return response.data;
    } catch (error) {
      console.error('Error adding member segment:', error);
      throw error;
    }
  }, [config]);
  
  const deleteMemberSegment = useCallback(async (id: string) => {
    try {
      const response = await deleteCall(
        `${config.REST_URL}/api/v1/membersegments/${id}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error deleting member segment:', error);
      throw error;
    }
  }, [config]);
  
  return {
    getAllSegments,
    getMemberSegments,
    addMemberSegment,
    deleteMemberSegment,
  };
};
