import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';

const createVertoUserName = () => {
  const userId = Auth.userID;
  const uName = Users.findOne({ userId }).user.name;
  return `FreeSWITCH User - ${encodeURIComponent(uName)}`;
};

export default class VertoScreenshareBridge {
  constructor() {
    // TODO - this info must be set in the call manager
    window.BBB = {};
    window.BBB.sessionToken = Auth.sessionToken;
  }

  vertoWatchVideo() {
    window.vertoWatchVideo(
      'screenshareVideo',
      BridgeService.getConferenceBridge(),
      createVertoUserName(),
      null,
      null,
      null,
    );
  }

  vertoExitVideo() {
    window.vertoExitVideo();
  }
}
