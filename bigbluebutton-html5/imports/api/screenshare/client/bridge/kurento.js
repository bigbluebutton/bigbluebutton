import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';

const CHROME_DEFAULT_EXTENSION_KEY = Meteor.settings.public.kurento.chromeDefaultExtensionKey;
const CHROME_CUSTOM_EXTENSION_KEY = Meteor.settings.public.kurento.chromeExtensionKey;

const CHROME_EXTENSION_KEY = CHROME_CUSTOM_EXTENSION_KEY === 'KEY' ? CHROME_DEFAULT_EXTENSION_KEY : CHROME_CUSTOM_EXTENSION_KEY;

const getUserId = () => Auth.userID;

const getMeetingId = () => Auth.meetingID;

const getUsername = () => Users.findOne({ userId: getUserId() }).name;

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
