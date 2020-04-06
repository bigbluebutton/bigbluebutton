import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import VideoStreams from '/imports/api/video-streams/';
import VideoService from '../service';

const PUBLIC_SETTINGS = Meteor.settings.public;
const baseName = PUBLIC_SETTINGS.app.cdn + PUBLIC_SETTINGS.app.basename;
const ROLE_MODERATOR = PUBLIC_SETTINGS.user.role_moderator;

const isSharingVideo = () => {
  const userId = Auth.userID;
  const videoStreams = VideoStreams.findOne({ userId }, { fields: {} });
  return !!videoStreams;
};

const videoShareAllowed = () => Settings.dataSaving.viewParticipantsWebcams;

const isDisabled = () => {
  const isWaitingResponse = VideoService.isWaitingResponse();
  const isConnected = VideoService.isConnected();

  const lockCam = VideoService.webcamsLocked();
  const user = Users.findOne({ userId: Auth.userID }, { fields: { locked: 1, role: 1 } });
  const userLocked = user.locked && user.role !== ROLE_MODERATOR;

  const isConnecting = (!isSharingVideo && isConnected);

  const isLocked = (lockCam && userLocked);

  return isLocked
      || isWaitingResponse
      || isConnecting
      || !videoShareAllowed();
};

export default {
  isSharingVideo,
  isDisabled,
  baseName,
  videoShareAllowed,
};
