import Settings from '/imports/ui/services/settings';
import mapUser from '/imports/ui/services/user/mapUser';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import VideoService from '../service';

const baseName = Meteor.settings.public.app.basename;

const isSharingVideo = () => {
  const userId = Auth.userID;
  const user = Users.findOne({ userId });
  return !!user.has_stream;
};

const isDisabled = () => {
  const isWaitingResponse = VideoService.isWaitingResponse();
  const isConnected = VideoService.isConnected();

  const videoSettings = Settings.dataSaving;
  const enableShare = !videoSettings.viewParticipantsWebcams;
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const LockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const webcamOnlyModerator = meeting.usersProp.webcamsOnlyForModerator;

  const user = Users.findOne({ userId: Auth.userID });
  const userLocked = mapUser(user).isLocked;

  const isConnecting = (!isSharingVideo && isConnected);
  const isLocked = (LockCam && userLocked) || webcamOnlyModerator;

  return isLocked
      || isWaitingResponse
      || isConnecting
      || enableShare;
};

export default {
  isSharingVideo,
  isDisabled,
  baseName,
};
