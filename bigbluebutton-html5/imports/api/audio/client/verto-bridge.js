import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { getVoiceBridge } from '/imports/ui/components/audio/service';

function createVertoUserName() {
  const uid = Auth.userID;
  const uName = Users.findOne({ userId: uid }).user.name;
  const conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
  return conferenceUsername;
}

function exitAudio() {
  window.vertoExitAudio();
}

function joinListenOnly() {
  window.vertoJoinListenOnly(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    null,
  );
}

function joinMicrophone() {
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

export default {
  joinListenOnly,
  joinMicrophone,
  exitAudio,
  vertoWatchVideo,
  shareVertoScreen,
};
