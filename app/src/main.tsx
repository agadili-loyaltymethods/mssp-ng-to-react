import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { App } from './App';
import { store } from './redux/store';
import { AppConfigProvider } from './AppConfig';
import { loadAppConfig } from './services/configService';

await loadAppConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppConfigProvider>
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  </AppConfigProvider>
);
