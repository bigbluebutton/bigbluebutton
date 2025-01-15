import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ConnectionStatusService from '../service';
import ConnectionStatusComponent from './component';

const connectionStatusContainer = props => <ConnectionStatusComponent {...props} />;

export default withTracker(() => ({
  connectionStatus: ConnectionStatusService.getConnectionStatus(),
  logMonitoringInterval: ConnectionStatusService.LOG_MONITORING_INTERVAL,
}))(connectionStatusContainer);
