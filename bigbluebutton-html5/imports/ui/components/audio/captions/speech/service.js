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

const THROTTLE_TIMEOUT = 1000;

const CONFIG = Meteor.settings.public.app.audioCaptions;
const ENABLED = CONFIG.enabled;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined';

const setSpeechLocale = (value) => {
  if (LANGUAGES.includes(value) || value === '') {
    Session.set('speechLocale', value);
  } else {
    // TODO: ERROR
  }
};

const setSpeechVoices = () => {
  if (typeof window.speechSynthesis === 'undefined') return;

  Session.set('speechVoices', window.speechSynthesis.getVoices().map((v) => v.lang));
};

// Trigger getVoices
setSpeechVoices();

const getSpeechVoices = () => {
  const voices = Session.get('speechVoices') || [];

  return voices.filter((v) => LANGUAGES.includes(v));
};

const setDefault = () => {
  const voices = getSpeechVoices();
  if (voices.includes(CONFIG.language.locale)) {
    setSpeechLocale(CONFIG.language.locale);
  } else {
    // TODO: ERROR
  }
};

const useDefault = () => ENABLED && CONFIG.language.default;

const initSpeechRecognition = () => {
  if (hasSpeechRecognitionSupport()) {
    // Effectivate getVoices
    setSpeechVoices();
    const speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    if (useDefault()) setDefault();

    return speechRecognition;
  }

  // TODO: WARN

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

const hasSpeechLocale = () => getSpeechLocale() !== '';

const isLocaleValid = (locale) => LANGUAGES.includes(locale);

const isEnabled = () => ENABLED && hasSpeechRecognitionSupport();

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

export default {
  LANGUAGES,
  hasSpeechRecognitionSupport,
  initSpeechRecognition,
  updateInterimTranscript,
  updateFinalTranscript,
  getSpeechVoices,
  getSpeechLocale,
  setSpeechLocale,
  isLocaleValid,
  isEnabled,
  isActive,
  getStatus,
  generateId,
  useDefault,
};
