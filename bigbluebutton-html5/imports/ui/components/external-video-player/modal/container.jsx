import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ExternalVideoModal from './component';
import { startWatching, getVideoUrl } from '../service';
import mediaService from '/imports/ui/components/media/service';

const ExternalVideoModalContainer = props => <ExternalVideoModal {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  startWatching,
  videoUrl: getVideoUrl(),
  toggleLayout: mediaService.toggleSwapLayout,
  isSwapped: mediaService.getSwapLayout(),
}))(ExternalVideoModalContainer));
