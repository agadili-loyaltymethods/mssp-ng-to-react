import { useCallback } from 'react';
import axios from 'axios';
import { useAppConfig } from '../contexts/AppConfigContext';
import { Segment } from '../types';

export const useSegmentService = () => {
  const { config } = useAppConfig();
  
  const getAllSegments = useCallback(async (query: string = '', limit: number = 10): Promise<Segment[]> => {
    try {
      const response = await axios.get<Segment[]>(
        `${config.config.REST_URL}/api/v1/segments?limit=${limit}&query=${query}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching segments:', error);
      throw error;
    }
  }, [config]);
  
  const getMemberSegments = useCallback(async (limit: number = 10, query: string) => {
    try {
      const response = await axios.get(
        `${config.config.REST_URL}/api/v1/membersegments?limit=${limit}&query=${query}`
      );
      return response.data;
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
      
      const response = await axios.post(
        `${config.config.REST_URL}/api/v1/membersegments`, 
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
      const response = await axios.delete(
        `${config.config.REST_URL}/api/v1/membersegments/${id}`
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
