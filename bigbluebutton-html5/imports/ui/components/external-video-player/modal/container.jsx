import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ExternalVideoModal from './component';
import Service from '../service';

const ExternalVideoModalContainer = (props) => {
  return <ExternalVideoModal {...props} />;
}


export default withModalMounter(withTracker(({ mountModal }) =>
  ({
    closeModal: () => {
      mountModal(null);
    },
    updateVideoUrl: Service.updateVideoUrl,
    startWatching: Service.startWatching,
    stopWatching: Service.stopWatching,
    url: Service.getVideoUrl(),
    hasVideo: Service.hasExternalVideo(),
  }))(ExternalVideoModalContainer));
