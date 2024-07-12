// src/api/index.js
import axios from 'axios';
import { useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';

const createAxiosInstance = (baseURL: string) =>
  axios.create({
    baseURL,
  });

const useApi = () => {
  const { getToken } = useAuth();
  const baseUrl = `${import.meta.env.VITE_API_URL || 'https://resume-api.acm.illinois.edu/api/v1/'}`;

  const api = useMemo(() => {
    const instance = createAxiosInstance(baseUrl);

    instance.interceptors.request.use(
      async (config) => {
        const authToken = await getToken();
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [baseUrl, getToken]);

  return api;
};

export { useApi };
