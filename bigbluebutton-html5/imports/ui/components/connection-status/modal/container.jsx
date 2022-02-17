import React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import Settings from '/imports/ui/services/settings';
import ConnectionStatusService from '../service';
import ConnectionStatusComponent from './component';

const connectionStatusContainer = props => <ConnectionStatusComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: (dataSaving, intl) => {
    ConnectionStatusService.updateDataSavingSettings(dataSaving, intl);
    mountModal(null);
  },
  connectionStatus: ConnectionStatusService.getConnectionStatus(),
  dataSaving: _.clone(Settings.dataSaving),
}))(connectionStatusContainer));
