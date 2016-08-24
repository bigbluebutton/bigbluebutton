import {getInStorage} from '/imports/ui/components/app/service';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { getVoiceBridge } from '/imports/api/phone';

function createVertoUserName() {
  const uid = Auth.userID;
  const uName = Users.findOne({ userId: uid }).user.name;
  const conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
  return conferenceUsername;
}

function vertoExitAudio() {
  window.vertoExitAudio();
}

function vertoJoinListenOnly() {
  window.vertoJoinListenOnly(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    null,
  );
}

function vertoJoinMicrophone() {
  window.vertoJoinMicrophone(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    null,
  );
}

function vertoWatchVideo() {
  window.vertoWatchVideo(
    'deskshareVideo',
    getVoiceBridge(),
    createVertoUserName(),
    null,
  );
}

function shareVertoScreen() {
  vertoManager.shareScreen(
    'deskshareVideo',
    getVoiceBridge(),
    createVertoUserName(),
    null,
  );
}

export {
  vertoJoinListenOnly,
  vertoJoinMicrophone,
  vertoWatchVideo,
  vertoExitAudio,
  shareVertoScreen,
};
