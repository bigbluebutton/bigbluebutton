import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ExternalVideoModal from './component';
import { startWatching, getVideoUrl } from '../service';
import UploadMediaService from '/imports/ui/components/upload/media/service';

const ExternalVideoModalContainer = props => <ExternalVideoModal {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  startWatching,
  files: UploadMediaService.getMediaFiles(),
  videoUrl: getVideoUrl(),
}))(ExternalVideoModalContainer));
