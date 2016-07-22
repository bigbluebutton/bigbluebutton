import {getInStorage} from '/imports/ui/components/app/service';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { clientConfig } from '/config';
import { getVoiceBridge } from '/imports/api/phone';

function createVertoUserName() {
  const uid = Auth.userID;
  const uName = Users.findOne({ userId: uid }).user.name;
  const conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
  return conferenceUsername;
}

function getVertoCredentials() {
  return {
    vertoPort: clientConfig.media.vertoPort,
    hostName: clientConfig.media.vertoServerAddress,
    login: '1008',
    password: clientConfig.media.freeswitchProfilePassword,
  };
}

function vertoExitAudio() {
  window.vertoExitAudio();
}

function vertoJoinListenOnly() {
  window.vertoJoinListenOnly(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    '1008',
    null,
    getVertoCredentials(),
  );
}

function vertoJoinMicrophone() {
  window.vertoJoinMicrophone(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    '1008',
    null,
    getVertoCredentials(),
  );
}

function vertoWatchVideo() {
  window.vertoWatchVideo(
    'deskshareVideo',
    getVoiceBridge(),
    createVertoUserName(),
    '1008',
    null,
    getVertoCredentials(),
  );
}

function shareVertoScreen() {
  vertoManager.shareScreen(
    'deskshareVideo',
    getVoiceBridge(),
    createVertoUserName(),
    '1008',
    null,
    getVertoCredentials(),
  );
}

export {
  vertoJoinListenOnly,
  vertoJoinMicrophone,
  vertoWatchVideo,
  vertoExitAudio,
  shareVertoScreen,
};
