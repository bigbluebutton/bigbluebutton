import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import {callServer} from '/imports/ui/services/api';
import {clientConfig} from '/config';
import {vertoExitAudio, vertoJoinListenOnly, vertoJoinMicrophone} from '/imports/api/verto';

let triedHangup = false;

function getVoiceBridge() {
  return Meetings.findOne({}).voiceConf;
}

function amIListenOnly() {
  const uid = Auth.userID;
  return Users.findOne({ userId: uid }).user.listenOnly;
}

// Periodically check the status of the WebRTC call, when a call has been established attempt to
// hangup, retry if a call is in progress, send the leave voice conference message to BBB
function exitAudio(afterExitCall) {
  if (!clientConfig.media.useSIPAudio) {
    vertoExitAudio();
    return;
  } else {
    // To be called when the hangup is initiated
    const hangupCallback = function () {
      console.log('Exiting Voice Conference');
    };

    // Checks periodically until a call is established so we can successfully end the call
    // clean state
    triedHangup = false;

    // function to initiate call
    const checkToHangupCall = (function (context, afterExitCall) {

      // if an attempt to hang up the call is made when the current session is not yet finished,
      // the request has no effect
      // keep track in the session if we haven't tried a hangup
      if (window.getCallStatus() != null && !triedHangup) {
        console.log('Attempting to hangup on WebRTC call');

        // notify BBB-apps we are leaving the call call if we are listen only
        if (amIListenOnly()) {
          callServer('listenOnlyRequestToggle', false);
        }

        window.webrtc_hangup(hangupCallback);

        // we have hung up, prevent retries
        triedHangup = true;

        if (afterExitCall) {
          afterExitCall(this, clientConfig.app.listenOnly);
        }
      } else {
        console.log('RETRYING hangup on WebRTC call in ' +
          `${clientConfig.media.WebRTCHangupRetryInterval} ms`);

        // try again periodically
        setTimeout(checkToHangupCall, clientConfig.media.WebRTCHangupRetryInterval);
      }
    })

    // automatically run function
    (this, afterExitCall);

    return false;
  };
}

// join the conference. If listen only send the request to the server
function joinVoiceCallSIP(options) {
  const extension = getVoiceBridge();
  console.log(options);
  if (clientConfig.media.useSIPAudio) {

    // create voice call params
    const joinCallback = function (message) {
      console.log('Beginning WebRTC Conference Call');
    };

    window.BBB = {};
    window.BBB.getMyUserInfo = function (callback) {
      const uid = Auth.userID;
      const result = {
        myUserID: uid,
        myUsername: Users.findOne({ userId: uid }).user.name,
        myInternalUserID: uid,
        myAvatarURL: null,
        myRole: 'getMyRole',
        amIPresenter: 'false',
        voiceBridge: extension,
        dialNumber: null,
      };
      return callback(result);
    };

    callIntoConference(extension, function () {}, options.isListenOnly);
    return;
  }
}

function joinListenOnly() {
  callServer('listenOnlyRequestToggle', true);
  if (clientConfig.media.useSIPAudio) {
    joinVoiceCallSIP({ isListenOnly: true });
  } else {
    vertoJoinListenOnly();
  }
}

function joinMicrophone() {
  if (clientConfig.media.useSIPAudio) {
    joinVoiceCallSIP({ isListenOnly: false });
  } else {
    vertoJoinMicrophone();
  }
}

export { joinListenOnly, joinMicrophone, exitAudio, getVoiceBridge, };
