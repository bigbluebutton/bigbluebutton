import {clientConfig} from '/config';
import {getVoiceBridge} from '/imports/api/phone';
import {getInStorage} from '/imports/ui/components/app/service';
import Users from '/imports/api/users';

function createVertoUserName() {
  const uid = getInStorage('userID');
  console.log(Users.find().fetch());
  const uName = Users.findOne({ userId: uid }).user.name;
  const conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
  return conferenceUsername;
}

function joinVertoAudio(options) {
  joinVertoCall(options);
}

function watchVertoVideo(options) {
  joinVertoCall(options);
}

function joinVertoCall(options) {
  console.log('joinVertoCall');
  const extension = options.extension || getVoiceBridge();

  if (!isWebRTCAvailable()) {
    return;
  }

  if (!clientConfig.useSIPAudio) {
    const vertoServerCredentials = {
      vertoPort: clientConfig.media.vertoPort,
      hostName: clientConfig.media.vertoServerAddress,
      login: conferenceIdNumber,
      password: clientConfig.media.freeswitchProfilePassword,
    };

    const conferenceUsername = createVertoUserName();
    let el = '';
    if (options.listenOnly || options.joinAudio) {
      // the element SIP is programmed to use to render SIP audio
      el = 'remote-media';
    } else {
      // where deskshare video will render
      el = 'deskshareVideo';
    }
    let wasCallSuccessful = false;
    let debuggerCallback = function (message) {
      console.log('CALLBACK: ' + JSON.stringify(message));

      //
      // Beginning of hacky method to make Firefox media calls succeed.
      // Always fail the first time. Retry on failure.
      //
      if (!!navigator.mozGetUserMedia && message.errorcode == 1001) {
        console.error('Firefox callback error code');
        const logCallback = function (m) {
          console.log('CALLBACK: ' + JSON.stringify(m));
        };

        callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, logCallback,
          el, options, vertoServerCredentials);
      }

      //
      // End of hacky method
      //
    };

    callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, debuggerCallback,
      el, options, vertoServerCredentials);
    return;
  }
}

export {
  createVertoUserName,
  joinVertoAudio,
  watchVertoVideo,
};
