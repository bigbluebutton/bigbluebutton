import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = props => <VideoPreview {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  startSharing: () => {
    mountModal(null);
    VideoService.joinVideo();
  },
  closeModal: () => mountModal(null),
  changeWebcam: deviceId => Service.changeWebcam(deviceId),
  webcamDeviceId: Service.webcamDeviceId(),
  changeProfile: profileId => Service.changeProfile(profileId),
  hasMediaDevices: deviceInfo.hasMediaDevices,
}))(VideoPreviewContainer));
