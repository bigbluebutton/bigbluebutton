import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';

const CHROME_EXTENSION_KEY = Meteor.settings.public.kurento.chromeExtensionKey;

const getUserId = () => {
  const userID = Auth.userID;
  return userID;
}

const getMeetingId = () => {
  const meetingID = Auth.meetingID;
  return meetingID;
}

const getUsername = () => {
  return Users.findOne({ userId: getUserId() }).name;
}

export default class KurentoScreenshareBridge {
  kurentoWatchVideo() {
    window.kurentoWatchVideo(
      'screenshareVideo',
      BridgeService.getConferenceBridge(),
      getUsername(),
      getMeetingId(),
      null,
      null,
    );
  }

  kurentoExitVideo() {
    window.kurentoExitVideo();
  }

  kurentoShareScreen() {
    window.kurentoShareScreen(
      'screenshareVideo',
      BridgeService.getConferenceBridge(),
      getUsername(),
      getMeetingId(),
      null,
      CHROME_EXTENSION_KEY,
    );
  }

  kurentoExitScreenShare() {
    window.kurentoExitScreenShare();
  }
}
