import VertoBridge from './verto';
import SIPBridge from './sip';
import AudioManager from './manager';

const MEDIA_CONFIG = Meteor.settings.public.media;

const audioBridge = MEDIA_CONFIG.useSIPAudio ? new SIPBridge() : new VertoBridge();

const audioManager = new AudioManager(audioBridge);

export default audioManager;
