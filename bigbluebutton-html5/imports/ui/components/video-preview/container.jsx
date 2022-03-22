import React from 'react';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = (props) => <VideoPreview {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  startSharing: (deviceId) => {
    mountModal(null);
    VideoService.joinVideo(deviceId);
  },
  stopSharing: (deviceId) => {
    mountModal(null);
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
  closeModal: () => mountModal(null),
  webcamDeviceId: Service.webcamDeviceId(),
  hasVideoStream: VideoService.hasVideoStream(),
}))(VideoPreviewContainer));
