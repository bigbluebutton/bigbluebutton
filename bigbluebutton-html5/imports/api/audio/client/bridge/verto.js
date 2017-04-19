import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { getVoiceBridge } from '/imports/ui/components/audio/service';
import BaseAudioBridge from './base';

const createVertoUserName = () => {
  const userId = Auth.userID;
  const uName = Users.findOne({ userId }).user.name;
  return 'FreeSWITCH User - ' + encodeURIComponent(uName);
};

export default class VertoBridge extends BaseAudioBridge {
  constructor(userId, username) {
    super();
    this.vertoUsername = 'FreeSWITCH User - ' + encodeURIComponent(username);
    console.log('vertoUsername=' + this.vertoUsername);
  }

  exitAudio() {
    window.vertoExitAudio();
  }

  joinListenOnly() {
    window.vertoJoinListenOnly(
      'remote-media',
      getVoiceBridge(),
      createVertoUserName(),
      null,
    );
  }

  joinMicrophone() {
    window.vertoJoinMicrophone(
      'remote-media',
      getVoiceBridge(),
      createVertoUserName(),
      null,
    );
  }

}
