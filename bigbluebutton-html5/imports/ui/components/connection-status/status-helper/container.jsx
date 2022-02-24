import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ConnectionStatusService from '../service';
import ConnectionStatusIconComponent from './component';

const connectionStatusIconContainer = props => <ConnectionStatusIconComponent {...props} />;

export default withTracker(() => {
  return {
    stats: ConnectionStatusService.getStats(),
  };
})(connectionStatusIconContainer);
