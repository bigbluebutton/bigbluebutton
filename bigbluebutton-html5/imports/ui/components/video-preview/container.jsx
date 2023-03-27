import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = (props) => <VideoPreview {...props} />;

export default withTracker(({ setIsOpen, callbackToClose }) => ({
  startSharing: (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    VideoService.joinVideo(deviceId);
  },
  stopSharing: (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    if (deviceId) {
      const streamId = VideoService.getMyStreamId(deviceId);
      if (streamId) VideoService.stopVideo(streamId);
    } else {
      VideoService.exitVideo();
    }
  },
  sharedDevices: VideoService.getSharedDevices(),
  isCamLocked: VideoService.isUserLocked(),
  camCapReached: VideoService.hasCapReached(),
  closeModal: () => {
    callbackToClose();
    setIsOpen(false);
  },
  webcamDeviceId: Service.webcamDeviceId(),
  hasVideoStream: VideoService.hasVideoStream(),
}))(VideoPreviewContainer);
