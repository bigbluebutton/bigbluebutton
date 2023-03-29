import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import ConnectionStatusService from '../service';
import ConnectionStatusComponent from './component';

const connectionStatusContainer = props => <ConnectionStatusComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  connectionStatus: ConnectionStatusService.getConnectionStatus(),
}))(connectionStatusContainer));
