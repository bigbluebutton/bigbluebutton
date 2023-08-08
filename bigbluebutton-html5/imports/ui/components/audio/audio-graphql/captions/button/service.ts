import { unique } from 'radash';
import { setSpeechVoices as setSpeechVoicesLocalState } from '/imports/ui/core/local-states/useSpeechVoices';
const THROTTLE_TIMEOUT = 1000;

const CONFIG = Meteor.settings.public.app.audioCaptions;
const ENABLED = CONFIG.enabled;
const PROVIDER = CONFIG.provider;
const LANGUAGES = CONFIG.language.available;
const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const hasSpeechRecognitionSupport = () =>
  typeof SpeechRecognitionAPI !== 'undefined' &&
  typeof window.speechSynthesis !== 'undefined' &&
  VALID_ENVIRONMENT;

export const setSpeechVoices = () => {
  if (!hasSpeechRecognitionSupport()) return;

  setSpeechVoicesLocalState(unique(window.speechSynthesis.getVoices().map((v) => v.lang)));
  setSpeechVoices();
};

// Trigger getVoices
setSpeechVoices();

export const isWebSpeechApi = () => PROVIDER === 'webspeech';

export const getSpeechVoices = (voices: string[]) => {
  if (!isWebSpeechApi()) return LANGUAGES;

  return voices.filter((v) => LANGUAGES.includes(v));
};

export default {
  getSpeechVoices,
};
