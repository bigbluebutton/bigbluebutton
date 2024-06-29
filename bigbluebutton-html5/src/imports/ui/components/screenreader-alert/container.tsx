import React from 'react';
import ScreenReaderAlert from './component';
import { useOlderAlert } from './queue';

const ScreenReaderAlertContainer = () => {
  const olderAlert = useOlderAlert();

  return (
    <ScreenReaderAlert
      olderAlert={olderAlert}
    />
  );
};

export default ScreenReaderAlertContainer;
