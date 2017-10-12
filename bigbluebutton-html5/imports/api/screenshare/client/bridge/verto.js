import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';

const createVertoUserName = () => {
  const userId = Auth.userID;
  const uName = Users.findOne({ userId }).user.name;
  return `FreeSWITCH User - ${encodeURIComponent(uName)}`;
};

export default class VertoScreenshareBridge {
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
