import Auth from '/imports/ui/services/auth';
import { clientConfig } from '/config';
import { getVoiceBridge } from '/imports/api/phone';

function createVertoUserName() {
  const uid = Auth.getUser();
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

    let wasCallSuccessful = false;
    let debuggerCallback = function (message) {
      console.log('CALLBACK: ' + JSON.stringify(message));

      //
      // Beginning of hacky method to make Firefox media calls succeed.
      // Always fail the first time. Retry on failure.
      //
      if (!!navigator.mozGetUserMedia && message.errorcode == 1001) {
        const logCallback = function (m) {
          console.log('CALLBACK: ' + JSON.stringify(m));
        };

        callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, logCallback,
          'webcam', options, vertoServerCredentials);
      }

      //
      // End of hacky method
      //
    };

    callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, debuggerCallback,
      'webcam', options, vertoServerCredentials);
    return;
  }
}

export {
  createVertoUserName,
  joinVertoAudio,
  watchVertoVideo,
};
