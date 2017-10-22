import BaseAudioBridge from './base';
import { makeCall } from '/imports/ui/services/api';
import IosHandler from '/imports/ui/services/ios-handler';

const VERTO_PORT = Meteor.settings.public.media.vertoPort;
const FS_USERNAME = Meteor.settings.public.media.fsUsername;
const FS_PASSWORD = Meteor.settings.public.media.fsPassword;

export default class IOSBridge extends BaseAudioBridge {
  constructor(userData) {
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
      callerIdName: `${userId}-bbbID-${username}`,
      callerIdNumber: voiceBridge,
      isListenOnly: null,
    };

    console.log('created a IOSBridge for audio', this.options);
  }

  joinListenOnly() {
    console.log('joinListenOnly');
    makeCall('listenOnlyToggle', true);
    this._joinVoiceCallIOS(true);
  }

  joinMicrophone() {
    console.log('joinMicrophone');
    this._joinVoiceCallIOS(false);
  }

  exitAudio(isListenOnly, afterExitCall = () => {}) {
    console.log('Exiting audio from iOS Bridge');
    if (isListenOnly) {
      makeCall('listenOnlyToggle', false);
    }

    const message = {
      method: 'hangup',
    };

    this._sendMessageToSwift(message);
    return false;
  }

  _sendCallParameters() {
    const options = this.options;

    let message = {
      method: 'call_params',
      fsWebSocketUrl: options.fsWebSocketUrl,
      fsLogin: options.fsLogin,
      fsPassword: options.fsPassword,
      fsVoiceBridgeNumber: options.fsVoiceBridgeNumber,
      sessId: options.sessId,
      callerIdName: options.callerIdName,
      callerIdNumber: options.callerIdNumber,
    };

    this._sendMessageToSwift(message);
  }

  _joinVoiceCallIOS(isListenOnly) {
    console.log('Joining audio using the iOS Bridge');
    console.log('listenOnly', isListenOnly);

    const options = this.options;

    let message = {
      method: 'call',
      fsWebSocketUrl: options.fsWebSocketUrl,
      fsLogin: options.fsLogin,
      fsPassword: options.fsPassword,
      fsVoiceBridgeNumber: options.fsVoiceBridgeNumber,
      sessId: options.sessId,
      callerIdName: options.callerIdName,
      callerIdNumber: options.callerIdNumber,
      isListenOnly,
    };

    if (isListenOnly) {
      message.callerIdName = "GLOBAL_AUDIO_" + callerIdName;
      console.log('callerIdName=' + callerIdName);
    }

    this._sendMessageToSwift(message);
  }

  _sendMessageToSwift(message) {
    console.log('Sending message to swift', message);
    IosHandler.postMessage(JSON.stringify(message));
  }
}
