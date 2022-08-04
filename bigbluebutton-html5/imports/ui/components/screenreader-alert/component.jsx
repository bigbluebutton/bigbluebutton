import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { removeAlert } from './service';

const ARIA_ALERT_EXT_TIMEOUT = 15000;

const ScreenReaderAlert = ({ olderAlert }) => {
  useEffect(() => {
    if (olderAlert) setTimeout(() => removeAlert(olderAlert.id), ARIA_ALERT_EXT_TIMEOUT);
  }, [olderAlert?.id]);

  return olderAlert ? createPortal(olderAlert.text, document.getElementById('aria-polite-alert')) : null;
};

export default ScreenReaderAlert;
