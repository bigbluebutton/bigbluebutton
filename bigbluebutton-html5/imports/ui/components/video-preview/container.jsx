import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const KURENTO_CONFIG = Meteor.settings.public.kurento;
const CAMERA_PROFILES = KURENTO_CONFIG.cameraProfiles;
const SKIP_VIDEO_PREVIEW = KURENTO_CONFIG.skipVideoPreview;
const SKIP_VIDEO_PREVIEW_TIMER = KURENTO_CONFIG.skipVideoPreviewTimer;

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
  userParameterProfile: getFromUserSettings('bbb_preferred_camera_profile', (CAMERA_PROFILES.filter(i => i.default) || {}).id),
  skipVideoPreview: getFromUserSettings('bbb_skip_video_preview', false) || SKIP_VIDEO_PREVIEW,
  skipVideoPreviewTimer: getFromUserSettings('bbb_skip_video_preview_timer', SKIP_VIDEO_PREVIEW_TIMER) || SKIP_VIDEO_PREVIEW_TIMER,
}))(VideoPreviewContainer));
