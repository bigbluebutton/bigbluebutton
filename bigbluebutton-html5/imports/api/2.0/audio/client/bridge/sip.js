import BaseAudioBridge from './base';

const RETRY_INTERVAL = Meteor.settings.public.media.WebRTCHangupRetryInterval;

export default class SIPBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    this.userData = userData;
    this.callStates = {
      callStarted: 'started',
      callEnded: 'ended',
      callDisconnected: 'failed',
    };
  }

  joinAudio({ isListenOnly, dialplan }, stunTurnServers, managerCallback) {
    return new Promise((resolve) => {
      const extension = dialplan || this.userData.voiceBridge;

      const callback = (message) => {
        managerCallback(message).then(() => resolve());
      };

      this.callIntoConference(extension, callback, isListenOnly, stunTurnServers);
    });
  }

  exitAudio() {
    return new Promise((resolve) => {
      let didTryHangup = false;

      const attemptHangup = () => {
        if (window.getCallStatus()) {
          console.log('Attempting to hangup on WebRTC call');
          didTryHangup = true;
          window.webrtc_hangup(() => resolve());
        } else {
          console.log('RETRYING hangup on WebRTC call in ' +
            `${RETRY_INTERVAL} ms`);
          setTimeout(attemptHangup, RETRY_INTERVAL);
        }
      };

      return attemptHangup();
    });
  }
}
