import _ from 'lodash';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import AudioService from '/imports/ui/components/audio/service';

const LANGUAGES = [
  'en-US',
  'es-ES',
  'pt-BR',
];

const CONFIG = Meteor.settings.public.app.audioCaptions;
const ENABLED = CONFIG.enabled;

const THROTTLE_TIMEOUT = 1000;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined';

const initSpeechRecognition = () => {
  if (hasSpeechRecognitionSupport()) {
    const speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    return speechRecognition;
  }

  return null;
};

const updateTranscript = (id, transcript, locale) => makeCall('updateTranscript', id, transcript, locale);

const throttledTranscriptUpdate = _.throttle(updateTranscript, THROTTLE_TIMEOUT, {
  leading: false,
  trailing: true,
});

const updateInterimTranscript = (id, transcript, locale) => {
  throttledTranscriptUpdate(id, transcript, locale);
};

const updateFinalTranscript = (id, transcript, locale) => {
  throttledTranscriptUpdate.cancel();
  updateTranscript(id, transcript, locale);
};

const getSpeechLocale = () => Session.get('speechLocale') || '';

const setSpeechLocale = (value) => {
  if (LANGUAGES.includes(value) || value === '') Session.set('speechLocale', value);
};

const isEnabled = () => ENABLED && hasSpeechRecognitionSupport();

const hasSpeechLocale = () => getSpeechLocale() !== '';

const isActive = () => isEnabled() && hasSpeechLocale();

const getStatus = () => {
  const active = isActive();
  const locale = getSpeechLocale();
  const audio = AudioService.isConnected() && !AudioService.isEchoTest() && !AudioService.isMuted();
  const connected = Meteor.status().connected && active && audio;
  const talking = AudioService.isTalking();

  return {
    locale,
    connected,
    talking,
  };
};

const generateId = () => `${Auth.userID}-${Date.now()}`;

const setDefault = () => setSpeechLocale(CONFIG.language.locale);

const useDefault = () => ENABLED && CONFIG.language.default;

const isLocaleValid = (locale) => LANGUAGES.includes(locale);

export default {
  LANGUAGES,
  hasSpeechRecognitionSupport,
  initSpeechRecognition,
  updateInterimTranscript,
  updateFinalTranscript,
  getSpeechLocale,
  setSpeechLocale,
  isEnabled,
  isActive,
  getStatus,
  generateId,
  useDefault,
  setDefault,
  isLocaleValid,
};
