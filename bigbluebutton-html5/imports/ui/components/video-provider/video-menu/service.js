import Settings from '/imports/ui/services/settings';
import mapUser from '/imports/ui/services/user/mapUser';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import MediaService from '/imports/ui/components/media/service';
import VideoService from '../service';

const baseName = Meteor.settings.public.app.basename;

const isSharingVideo = () => {
  const userId = Auth.userID;
  const user = Users.findOne({ userId });
  return !!user.has_stream;
};

const videoShareAllowed = () => Settings.dataSaving.viewParticipantsWebcams;


const isDisabled = () => {
  const isWaitingResponse = VideoService.isWaitingResponse();
  const isConnected = VideoService.isConnected();

  const lockCam = VideoService.isLocked();
  const user = Users.findOne({ userId: Auth.userID });
  const userLocked = mapUser(user).isLocked;

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
  toggleSwapLayout: MediaService.toggleSwapLayout,
  videoShareAllowed,
};
