import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import { getConferenceBridge } from './service';

// TODO pass info in constructor instead of importing ^^
const createVertoUserName = () => {
  const userId = Auth.userID;
  const uName = Users.findOne({ userId }).user.name;
  return `FreeSWITCH User - ${encodeURIComponent(uName)}`;
};

export default class VertoScreenshareBridge {
  constructor() {
    this.data = { getConferenceBridge };
  }

  vertoWatchVideo() {
    window.vertoWatchVideo(
      'screenshareVideo',
      this.data.getConferenceBridge(),
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

