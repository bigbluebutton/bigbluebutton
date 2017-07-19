import Auth from '/imports/ui/services/auth';
import BaseAudioBridge from '../bridge/base';
import VertoBridge from '../bridge/verto';
import SIPBridge from '../bridge/sip';

// manages audio calls and audio bridges
export default class AudioManager {
  constructor(userData) {
    const MEDIA_CONFIG = Meteor.settings.public.media;
    const audioBridge = MEDIA_CONFIG.useSIPAudio
      ? new SIPBridge(userData)
      : new VertoBridge(userData);

    if (!(audioBridge instanceof BaseAudioBridge)) {
      throw 'Audio Bridge not compatible';
    }

    this.bridge = audioBridge;
    this.isListenOnly = false;
    this.microphoneLockEnforced = userData.microphoneLockEnforced;
  }

  exitAudio() {
    this.bridge.exitAudio(this.isListenOnly);
  }

  joinAudio(listenOnly) {
    AudioManager.fetchServers().then(({ error, stunServers, turnServers }) => {
      if (error) {
        //We need to alert the user about this problem by some gui message.
        console.err("Couldn't fetch the stuns/turns servers!");
        return;
      }

      if (listenOnly || this.microphoneLockEnforced) {
        this.isListenOnly = true;
        this.bridge.joinListenOnly(stunServers, turnServers);
      } else {
        this.bridge.joinMicrophone(stunServers, turnServers);
      }
    });
  }

  // We use on the SIP an String Array, while in the server, it comes as
  // an Array of objects, we need to map from Array<Object> to Array<String>
  static mapToArray({ returnCode, stunServers, turnServers }) {
    const promise = new Promise((resolve) => {
      if (returnCode === 'FAILED') {
        resolve({ error: 404, stunServers: [], turnServers: [] });
      }
      resolve({
        stunServers: stunServers.map(server => server.url),
        turnServers: turnServers.map(server => server.url),
      });
    });
    return promise;
  }

  static fetchServers() {
    const url = `/bigbluebutton/api/stuns?sessionToken=${Auth.sessionToken}`;

    return fetch(url)
      .then(response => response.json())
      .then(response => AudioManager.mapToArray(response));
  }
}
