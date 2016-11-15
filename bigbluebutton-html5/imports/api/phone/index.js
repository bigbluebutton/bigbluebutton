import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import {callServer} from '/imports/ui/services/api';
import {vertoExitAudio, vertoJoinListenOnly, vertoJoinMicrophone} from '/imports/api/verto';

const APP_CONFIG = Meteor.settings.public.app;
const MEDIA_CONFIG = Meteor.settings.public.media;

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

function exitAudio(afterExitCall = () => {}) {
  if (!MEDIA_CONFIG.useSIPAudio) {
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
    const checkToHangupCall = ((context, afterExitCall = () => {}) => {

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
          afterExitCall(this, APP_CONFIG.listenOnly);
        }
      } else {
        console.log('RETRYING hangup on WebRTC call in ' +
          `${MEDIA_CONFIG.WebRTCHangupRetryInterval} ms`);

        // try again periodically
        setTimeout(checkToHangupCall, MEDIA_CONFIG.WebRTCHangupRetryInterval);
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
  if (MEDIA_CONFIG.useSIPAudio) {

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

    const m = Meetings.findOne();
    const st = {
      stun: m.stuns,
      turn: m.turns,
    };

    callIntoConference(extension, function () {}, options.isListenOnly, st);
    return;
  }
}

function joinListenOnly() {
  callServer('listenOnlyRequestToggle', true);
  if (MEDIA_CONFIG.useSIPAudio) {
    joinVoiceCallSIP({ isListenOnly: true });
  } else {
    vertoJoinListenOnly();
  }
}

function joinMicrophone() {
  if (MEDIA_CONFIG.useSIPAudio) {
    joinVoiceCallSIP({ isListenOnly: false });
  } else {
    vertoJoinMicrophone();
  }
}

export { joinListenOnly, joinMicrophone, exitAudio, getVoiceBridge, };
