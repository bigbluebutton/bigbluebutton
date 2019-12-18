import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = props => <VideoPreview {...props} />;

export default withModalMounter(withTracker(({ mountModal, fromInterface }) => ({
  startSharing: deviceId => {
    mountModal(null);
    VideoService.joinVideo(deviceId);
  },
  stopSharing: deviceId => {
    mountModal(null);
    const stream = VideoService.getMyStream(deviceId);
    if (stream) VideoService.stopVideo(stream);
  },
  sharedDevices: VideoService.getSharedDevices(),
  closeModal: () => mountModal(null),
  changeWebcam: deviceId => Service.changeWebcam(deviceId),
  webcamDeviceId: Service.webcamDeviceId(),
  changeProfile: profileId => Service.changeProfile(profileId),
  hasMediaDevices: deviceInfo.hasMediaDevices,
  skipVideoPreview: VideoService.getSkipVideoPreview(fromInterface),
}))(VideoPreviewContainer));
