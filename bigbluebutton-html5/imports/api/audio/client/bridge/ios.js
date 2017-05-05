import BaseAudioBridge from './base';

const VERTO_PORT = Meteor.settings.public.media.vertoPort;
const FS_USERNAME = Meteor.settings.public.media.fsUsername;
const FS_PASSWORD = Meteor.settings.public.media.fsPassword;

export default class IOSBridge extends BaseAudioBridge {
  constructor(userData) {
    console.log('IOSBridge constructor');

    super();

    const {
      username,
      voiceBridge,
      userId,
    } = userData;

    this.options = {
      fsWebSocketUrl: `wss://${window.location.host}:${VERTO_PORT}`,
      fsLogin: FS_USERNAME,
      fsPassword: FS_PASSWORD,
      fsVoiceBridgeNumber: voiceBridge,
      sessId: userId + Date.now(),
      // callerIdName: username,
      callerIdName: `${userId}-bbbID-${username}`,
      callerIdNumber: voiceBridge,
      isListenOnly: null,
    };

    // this.joinListenOnly();
  }

  joinListenOnly() {
    this.options.isListenOnly = true;
    this._joinVoiceCallIOS();
  }

  joinMicrophone() {
    this.options.isListenOnly = false;
    this._joinVoiceCallIOS();
  }

  exitAudio(isListenOnly, afterExitCall = () => {}) {
    return false;
  }


  _joinVoiceCallIOS() {
    this.options.method = 'call';

    window.webkit.messageHandlers.bbb.postMessage(JSON.stringify(this.options))
    console.log('joining audio using the iOS bridge', this.options);
    console.log('Tiago, aqui esta o log, estou te mandando esse treco', this.options);
  }
}
