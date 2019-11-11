import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import VideoPreviewService from '/imports/ui/components/video-preview/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import VideoService from '../service';
import AutoPlayVideo from './component';

const KURENTO_CONFIG = Meteor.settings.public.kurento;
const SKIP_VIDEO_PREVIEW = KURENTO_CONFIG.skipVideoPreview;

export default withTracker(() => ({
  changeWebcam: deviceId => VideoPreviewService.changeWebcam(deviceId),
  webcamDeviceId: VideoPreviewService.webcamDeviceId(),
  changeProfile: profileId => VideoPreviewService.changeProfile(profileId),
  hasMediaDevices: deviceInfo.hasMediaDevices,
  startVideo: VideoService.joinVideo,
  skipVideoPreviewSettings: SKIP_VIDEO_PREVIEW,
  skipVideoPreviewParameter: getFromUserSettings('bbb_skip_video_preview', false),
  autoShareWebcam: getFromUserSettings('autoShareWebcam', KURENTO_CONFIG.autoShareWebcam),
}))(AutoPlayVideo);
