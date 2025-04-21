import { useCallback } from 'react';
import axios from 'axios';
import { useAppConfig } from '../contexts/AppConfigContext';

export const useProductService = () => {
  const { config } = useAppConfig();
  
  // Cache for products
  const cache: Record<string, any> = {};

  const getProducts = useCallback(async () => {
    if (!cache['allProducts']) {
      try {
        const response = await axios.get(`${config.config.REST_URL}/api/v1/products`);
        cache['allProducts'] = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        cache['allProducts'] = null;
        throw error;
      }
    }
    return cache['allProducts'];
  }, [config]);

  const getOtherProducts = useCallback(async (category: string, subcategory?: string) => {
    const cacheKey = `${category}_${subcategory || ''}`;
    
    if (!cache[cacheKey]) {
      try {
        const params: any = { category };
        if (subcategory) {
          params.subcategory = subcategory;
        }
        
        const response = await axios.get(`${config.config.REST_URL}/api/v1/other-products`, { params });
        cache[cacheKey] = response.data;
      } catch (error) {
        console.error('Error fetching other products:', error);
        cache[cacheKey] = null;
        throw error;
      }
    }
    
    return cache[cacheKey];
  }, [config]);

  const clearCache = useCallback(() => {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  }, []);

  return {
    getProducts,
    getOtherProducts,
    clearCache
  };
};
