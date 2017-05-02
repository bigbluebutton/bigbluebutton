import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { getVoiceBridge } from '/imports/ui/components/audio/service';

// TODO pass info in constructor instead of importing ^^
const createVertoUserName = () => {
  const userId = Auth.userID;
  const uName = Users.findOne({ userId }).user.name;
  return 'FreeSWITCH User - ' + encodeURIComponent(uName);
};

export default class VertoDeskshareBridge {
  constructor() {
  }

  vertoWatchVideo() {
    window.vertoWatchVideo(
      'deskshareVideo',
      getVoiceBridge(),
      createVertoUserName(),
      null,
      null,
      null,
    );
  }

  // TODO add vertoExitVideo
}
