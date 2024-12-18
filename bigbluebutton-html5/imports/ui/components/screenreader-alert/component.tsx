import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { shiftAlert } from './service';
import { ScreenReaderAlert as ScreenReaderAlertResponse } from './queue';

const ARIA_ALERT_EXT_TIMEOUT = 15000;

interface Props {
  olderAlert: ScreenReaderAlertResponse | undefined;
}

const ScreenReaderAlert: React.FC<Props> = ({ olderAlert }) => {
  useEffect(() => {
    if (olderAlert) setTimeout(() => shiftAlert(), ARIA_ALERT_EXT_TIMEOUT);
  }, [olderAlert?.id]);

  const ariaAlertsElement = document.getElementById('aria-polite-alert');

  return (olderAlert && olderAlert.text && ariaAlertsElement !== null)
    ? createPortal(olderAlert.text, document.getElementById('aria-polite-alert') as HTMLElement)
    : null;
};

export default ScreenReaderAlert;
