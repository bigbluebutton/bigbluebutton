import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ExternalVideoModal from './component';
import { startWatching, stopWatching, getVideoId } from '../service';

const ExternalVideoModalContainer = props => <ExternalVideoModal {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  startWatching,
  stopWatching,
  videoId: getVideoId(),
}))(ExternalVideoModalContainer));
