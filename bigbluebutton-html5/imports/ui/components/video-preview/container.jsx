import React from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/service';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

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
}))(VideoPreviewContainer));
