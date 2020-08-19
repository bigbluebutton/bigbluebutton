import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import RemoteDesktopModal from './component';
import { startWatching, getRemoteDesktopUrl } from '../service';

const RemoteDesktopModalContainer = props => <RemoteDesktopModal {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  startWatching,
  remoteDesktopUrl: getRemoteDesktopUrl(),
}))(RemoteDesktopModalContainer));
