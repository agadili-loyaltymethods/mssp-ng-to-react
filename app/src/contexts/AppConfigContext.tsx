import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { environment } from '../environments/environment';

interface AppConfig {
  config: {
    REST_URL: string;
    RC_REST_URL: string;
  };
}

interface AppConfigContextType {
  config: AppConfig;
  isLoading: boolean;
  error: Error | null;
}

const defaultConfig: AppConfig = {
  config: {
    REST_URL: environment.REST_URL,
    RC_REST_URL: environment.REST_URL,
  },
};

const AppConfigContext = createContext<AppConfigContextType>({
  config: defaultConfig,
  isLoading: true,
  error: null,
});

export const useAppConfig = () => useContext(AppConfigContext);

interface AppConfigProviderProps {
  children: ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get<AppConfig>(`${environment.REST_URL}/init`);
        setConfig(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </AppConfigContext.Provider>
  );
};
