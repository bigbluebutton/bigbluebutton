import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import ExternalVideoModal from './component';
import { startWatching, getVideoUrl } from '../service';

const ExternalVideoModalContainer = props => <ExternalVideoModal {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  startWatching,
  videoUrl: getVideoUrl(),
}))(ExternalVideoModalContainer));
