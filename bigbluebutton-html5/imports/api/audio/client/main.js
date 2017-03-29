import { callServer } from '/imports/ui/services/api';

import VertoBridge from './verto-bridge';
import SIPBridge from './sip-bridge';

const MEDIA_CONFIG = Meteor.settings.public.media;

// pick between SIP or Verto
let audioBridge = undefined;
audioBridge = MEDIA_CONFIG.useSIPAudio ? SIPBridge : VertoBridge;

function exitAudio(afterExitCall = () => {}) {
  audioBridge.exitAudio();
}

function joinListenOnly() {
  callServer('listenOnlyRequestToggle', true);
  audioBridge.joinListenOnly();
}

function joinMicrophone() {
  audioBridge.joinMicrophone();
}

export {
  joinListenOnly,
  joinMicrophone,
  exitAudio,
};
