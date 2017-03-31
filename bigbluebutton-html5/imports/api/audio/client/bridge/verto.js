import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { getVoiceBridge } from '/imports/ui/components/audio/service';
import BaseAudioBridge from './base';

export default class VertoBridge extends BaseAudioBridge {
  constructor() {
    super();
  }

  createVertoUserName() {
    const uid = Auth.userID;
    const uName = Users.findOne({ userId: uid }).user.name;
    const conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
    return conferenceUsername;
  }

  exitAudio() {
    window.vertoExitAudio();
  }

  joinListenOnly() {
    window.vertoJoinListenOnly(
      'remote-media',
      getVoiceBridge(),
      this.createVertoUserName(),
      null,
    );
  }

  joinMicrophone() {
    window.vertoJoinMicrophone(
      'remote-media',
      getVoiceBridge(),
      this.createVertoUserName(),
      null,
    );
  }

  vertoWatchVideo() {
    window.vertoWatchVideo(
      'deskshareVideo',
      getVoiceBridge(),
      this.createVertoUserName(),
      null,
    );
  }

  shareVertoScreen() {
    vertoManager.shareScreen(
      'deskshareVideo',
      getVoiceBridge(),
      this.createVertoUserName(),
      null,
    );
  }

}
