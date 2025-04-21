import { useCallback } from 'react';
import { useSnackbar, OptionsObject, SnackbarKey } from 'notistack';

export const useAlertService = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const successAlert = useCallback((message: string, action?: string, duration?: number): { onAction: () => { subscribe: (callback: () => void) => void } } => {
    const options: OptionsObject = {
      variant: 'success',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
      autoHideDuration: duration || 1500,
    };

    let snackbarKey: SnackbarKey;
    
    if (action) {
      options.action = () => (
        <button 
          onClick={() => {
            if (actionCallback) actionCallback();
            closeSnackbar(snackbarKey);
          }}
          style={{
            color: 'white',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {action}
        </button>
      );
    }

    let actionCallback: (() => void) | null = null;

    snackbarKey = enqueueSnackbar(message, options);

    return {
      onAction: () => ({
        subscribe: (callback: () => void) => {
          actionCallback = callback;
        }
      })
    };
  }, [enqueueSnackbar, closeSnackbar]);

  const errorAlert = useCallback((message: string, action?: string, duration?: number): { onAction: () => { subscribe: (callback: () => void) => void } } => {
    const options: OptionsObject = {
      variant: 'error',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
      autoHideDuration: duration || 0,
    };

    let snackbarKey: SnackbarKey;
    
    if (action) {
      options.action = () => (
        <button 
          onClick={() => {
            if (actionCallback) actionCallback();
            closeSnackbar(snackbarKey);
          }}
          style={{
            color: 'white',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {action}
        </button>
      );
    }

    let actionCallback: (() => void) | null = null;

    snackbarKey = enqueueSnackbar(message, options);

    return {
      onAction: () => ({
        subscribe: (callback: () => void) => {
          actionCallback = callback;
        }
      })
    };
  }, [enqueueSnackbar, closeSnackbar]);

  const infoAlert = useCallback((message: string, action?: string): { onAction: () => { subscribe: (callback: () => void) => void } } => {
    const options: OptionsObject = {
      variant: 'info',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    };

    let snackbarKey: SnackbarKey;
    
    if (action) {
      options.action = () => (
        <button 
          onClick={() => {
            if (actionCallback) actionCallback();
            closeSnackbar(snackbarKey);
          }}
          style={{
            color: 'white',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {action}
        </button>
      );
    }

    let actionCallback: (() => void) | null = null;

    snackbarKey = enqueueSnackbar(message, options);

    return {
      onAction: () => ({
        subscribe: (callback: () => void) => {
          actionCallback = callback;
        }
      })
    };
  }, [enqueueSnackbar, closeSnackbar]);

  const closeAlert = useCallback(() => {
    closeSnackbar();
  }, [closeSnackbar]);

  return {
    successAlert,
    errorAlert,
    infoAlert,
    closeAlert,
  };
};
