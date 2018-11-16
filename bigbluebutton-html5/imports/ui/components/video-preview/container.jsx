import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = props => <VideoPreview {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
  startSharing: () => {
    mountModal(null);
    VideoService.joinVideo();
  },
  changeWebcam: deviceId => Service.changeWebcam(deviceId),
  webcamDeviceId: Service.webcamDeviceId(),
}))(VideoPreviewContainer));

