import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = props => <VideoPreview {...props} />;

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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
  closeModal: () => mountModal(null),
  webcamDeviceId: Service.webcamDeviceId(),
  hasVideoStream: VideoService.hasVideoStream(),
}))(VideoPreviewContainer));
