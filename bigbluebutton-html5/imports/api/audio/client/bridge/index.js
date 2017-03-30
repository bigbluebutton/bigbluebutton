import { callServer } from '/imports/ui/services/api';

import VertoBridge from './verto';
import SIPBridge from './sip';
import BaseAudioService from './base';

const MEDIA_CONFIG = Meteor.settings.public.media;

export default class AudioAPI extends BaseAudioService {
  constructor() {
    super();
    this.audioBridge = undefined;
    this.audioBridge = MEDIA_CONFIG.useSIPAudio ? new SIPBridge() : new VertoBridge();
  }

  exitAudio (afterExitCall = () => {}) {
    this.audioBridge.exitAudio();
  }

  joinListenOnly() {
    callServer('listenOnlyRequestToggle', true);
    this.audioBridge.joinListenOnly();
  }

  joinMicrophone() {
    this.audioBridge.joinMicrophone();
  }

};
