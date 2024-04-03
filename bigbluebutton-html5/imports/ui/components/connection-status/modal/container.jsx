import React from 'react';
import { useSubscription } from '@apollo/client';
import { CONNECTION_STATUS_REPORT_SUBSCRIPTION } from '../queries';
import Service from '../service';
import Component from './component';

const ConnectionStatusContainer = (props) => {
  const { data } = useSubscription(CONNECTION_STATUS_REPORT_SUBSCRIPTION);
  const connectionData = data ? Service.sortConnectionData(data.user_connectionStatusReport) : [];
  return (
    <Component
      connectionData={connectionData}
      {...props}
    />
  );
};

export default ConnectionStatusContainer;
