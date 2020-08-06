import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const VideoPreviewContainer = props => <VideoPreview {...props} />;

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const isCamLocked = () => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'lockSettingsProps.disableCam': 1 } });
  const user = Users.findOne({ meetingId: Auth.meetingID, userId: Auth.userID },
    { fields: { locked: 1, role: 1 } });

  if (meeting.lockSettingsProps !== undefined) {
    if (user.locked && user.role !== ROLE_MODERATOR) {
      return meeting.lockSettingsProps.disableCam;
    }
  }
  return false;
};

export default withModalMounter(withTracker(({ mountModal, fromInterface }) => ({
  startSharing: deviceId => {
    mountModal(null);
    VideoService.joinVideo(deviceId);
  },
  stopSharing: deviceId => {
    mountModal(null);
    if (deviceId) {
      const stream = VideoService.getMyStream(deviceId);
      if (stream) VideoService.stopVideo(stream);
    } else {
      VideoService.exitVideo();
    }
  },
  sharedDevices: VideoService.getSharedDevices(),
  isCamLocked: isCamLocked(),
  closeModal: () => mountModal(null),
  changeWebcam: deviceId => Service.changeWebcam(deviceId),
  webcamDeviceId: Service.webcamDeviceId(),
  changeProfile: profileId => Service.changeProfile(profileId),
  hasMediaDevices: deviceInfo.hasMediaDevices,
  skipVideoPreview: VideoService.getSkipVideoPreview(fromInterface),
  hasVideoStream: VideoService.hasVideoStream(),
}))(VideoPreviewContainer));
