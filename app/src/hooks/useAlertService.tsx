import React, { useState } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

interface Alert {
  message: string;
  severity: 'success' | 'error' | 'info';
  action?: string;
}

interface AlertProperties {
  isActionNeed: boolean;
  onActionMethod?: () => void;
}

const useAlertService = () => {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<Alert>({ message: '', severity: 'info' });
  const [alertProperties, setAlertProperties] = useState<AlertProperties>({isActionNeed: false});

  const successAlert = (message: string, action?: string, duration: number = 1500, onActionMethodDef?: () => void) => {
    setAlert({ message, severity: 'success', action });
    setOpen(true);
    if(onActionMethodDef){
      setAlertProperties({isActionNeed: true, onActionMethod: onActionMethodDef});
    }
    setTimeout(() => setOpen(false), duration);
  };

  const errorAlert = (message: string, action?: string, duration: number = 0, onActionMethodDef?: () => void) => {
    setAlert({ message, severity: 'error', action });
    setOpen(true);
    if(onActionMethodDef){
      setAlertProperties({isActionNeed: true, onActionMethod: onActionMethodDef});
    }
    if (duration !== 0) {
      setTimeout(() => setOpen(false), duration);
    }
  };

  const infoAlert = (message: string, action?: string) => {
    setAlert({ message, severity: 'info', action });
    setOpen(true);
  };

  const closeAlert = () => {
    setOpen(false);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleAction = () => {
    setOpen(false);
  };

  const AlertComponent = () => (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      action={alertProperties.isActionNeed &&
      <React.Fragment>
          <button onClick={alertProperties.onActionMethod}>{alert.action || 'Dismiss'}</button>
        </React.Fragment>
      }
    >
      <MuiAlert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
        {alert.message}
      </MuiAlert>
    </Snackbar>
  );

  return {
    successAlert,
    errorAlert,
    infoAlert,
    closeAlert,
    Alert: <AlertComponent />,
  };
};

export default useAlertService;