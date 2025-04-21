// src/configService.ts
export interface AppConfig {
    config: {
        REST_URL: string,
        RC_REST_URL: string
    }
}

let config: AppConfig | null = null;

export const loadAppConfig = async (): Promise<void> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/init`);
    const data = await res.json();

    config = { ...data, };
};

export const getAppConfig = (): AppConfig => {
    if (!config) throw new Error('App config not loaded yet!');
    return config;
};
