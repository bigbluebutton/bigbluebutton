import { makeCall } from '/imports/ui/services/api';

import BaseAudioBridge from './base';

const APP_CONFIG = Meteor.settings.public.app;
const MEDIA_CONFIG = Meteor.settings.public.media;

let triedHangup = false;

export default class SIPBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    this.userData = userData;
  }

  joinListenOnly(stunServers, turnServers, callbackFromManager) {
    makeCall('listenOnlyToggle', true);
    this._joinVoiceCallSIP({ isListenOnly: true }, stunServers, turnServers, callbackFromManager);
  }

  joinMicrophone(stunServers, turnServers, callbackFromManager) {
    this._joinVoiceCallSIP({ isListenOnly: false }, stunServers, turnServers, callbackFromManager);
  }

  // Periodically check the status of the WebRTC call, when a call has been established attempt to
  // hangup, retry if a call is in progress, send the leave voice conference message to BBB
  exitAudio(isListenOnly, afterExitCall = () => { }) {
    // To be called when the hangup is confirmed
    const hangupCallback = function () {
      console.log(`Exited Voice Conference, listenOnly=${isListenOnly}`);

      // notify BBB-apps we are leaving the call if we are in listen only mode
      if (isListenOnly) {
        makeCall('listenOnlyToggle', false);
      }
    };

    // Checks periodically until a call is established so we can successfully
    // end the call clean state
    triedHangup = false;

    // function to initiate call
    const checkToHangupCall = ((context, afterExitCall = () => { }) => {
      // if an attempt to hang up the call is made when the current session is not yet finished,
      // the request has no effect keep track in the session if we haven't tried a hangup
      if (window.getCallStatus() != null && !triedHangup) {
        console.log('Attempting to hangup on WebRTC call');
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
    })(this, afterExitCall);

    return false;
  }

  // join the conference. If listen only send the request to the server
  _joinVoiceCallSIP(options, stunServers, turnServers, callbackFromManager) {
    const extension = this.userData.voiceBridge;
    console.log(options);

    // create voice call params
    const joinCallback = function (message) {
      console.log('Beginning WebRTC Conference Call');
    };

    const stunsAndTurns = {
      stun: stunServers,
      turn: turnServers,
    };

    callIntoConference(extension, callbackFromManager, options.isListenOnly, stunsAndTurns);
  }
}
