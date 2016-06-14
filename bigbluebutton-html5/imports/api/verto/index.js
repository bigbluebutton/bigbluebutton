import {clientConfig} from '/config';
import {getVoiceBridge} from '/imports/api/phone';
import {getInStorage} from '/imports/ui/components/app/service';
import Users from '/imports/api/users';

let vertoManager = null;

function vertoInitialize() {
  console.log('verto initialized');
  vertoManager = new VertoManager();
}

function createVertoUserName() {
  const uid = getInStorage('userID');
  console.log(Users.find().fetch());
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

function exitVertoAudio() {
  vertoManager.exitAudio();
}

function joinVertoListenOnly() {
  vertoManager.joinListenOnly(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    '1008',
    null,
    getVertoCredentials(),
  );
}

function joinVertoMicrophone() {
  vertoManager.joinMicrophone(
    'remote-media',
    getVoiceBridge(),
    createVertoUserName(),
    '1008',
    null,
    getVertoCredentials(),
  );
}

function watchVertoVideo() {
  vertoManager.joinWatchVideo(
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
  joinVertoListenOnly,
  joinVertoMicrophone,
  watchVertoVideo,
  exitVertoAudio,
  vertoInitialize,
  shareVertoScreen,
};
