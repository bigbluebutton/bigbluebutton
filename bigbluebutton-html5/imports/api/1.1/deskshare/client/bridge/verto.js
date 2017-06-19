import Users from '/imports/api/1.1/users';
import Auth from '/imports/ui/services/auth';
import { getConferenceBridge } from './service';

// TODO pass info in constructor instead of importing ^^
const createVertoUserName = () => {
  const userId = Auth.userID;
  const uName = Users.findOne({ userId }).user.name;
  return `FreeSWITCH User - ${encodeURIComponent(uName)}`;
};

export default class VertoDeskshareBridge {
  constructor() {
    this.data = { getConferenceBridge };
  }

  vertoWatchVideo() {
    window.vertoWatchVideo(
      'deskshareVideo',
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

