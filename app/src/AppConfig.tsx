import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface Config {
  REST_URL: string;
  RC_REST_URL: string;
}

interface AppConfigContextType {
  config: Config | null;
  isLoading: boolean;
  error: Error | null;
}

const AppConfigContext = createContext<AppConfigContextType>({
  config: null,
  isLoading: true,
  error: null
});

export const useAppConfig = () => useContext(AppConfigContext);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await axios.get<Config>(`${process.env.REST_URL}/init`);
        setConfig(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </AppConfigContext.Provider>
  );
};