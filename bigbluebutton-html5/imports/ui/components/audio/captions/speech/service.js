import _ from 'lodash';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import AudioService from '/imports/ui/components/audio/service';

const DEFAULT_LANGUAGE = 'pt-BR';
const ENABLED = Meteor.settings.public.app.enableAudioCaptions;
const THROTTLE_TIMEOUT = 1000;

const hasVendorSupport = () => {
  if (window.speechSynthesis && typeof window.speechSynthesis.getVoices === 'function') {
    const voices = window.speechSynthesis.getVoices();

    if (Array.isArray(voices)) return voices.length > 0;
  }

  return false;
};

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined' && hasVendorSupport();

const initSpeechRecognition = (locale = DEFAULT_LANGUAGE) => {
  if (hasSpeechRecognitionSupport()) {
    const speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = locale;

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

const getSpeech = () => Session.get('speech') || false;

const setSpeech = (value) => Session.set('speech', value);

const isEnabled = () => ENABLED && hasSpeechRecognitionSupport();

const isActive = () => isEnabled() && getSpeech();

const getStatus = () => {
  const active = isActive();
  const audio = AudioService.isConnected() && !AudioService.isEchoTest() && !AudioService.isMuted();
  const connected = Meteor.status().connected && active && audio;
  const talking = AudioService.isTalking();

  return {
    locale: DEFAULT_LANGUAGE,
    connected,
    talking,
  };
};

const generateId = () => `${Auth.userID}-${Date.now()}`;

export default {
  hasSpeechRecognitionSupport,
  initSpeechRecognition,
  updateInterimTranscript,
  updateFinalTranscript,
  getSpeech,
  setSpeech,
  isEnabled,
  isActive,
  getStatus,
  generateId,
};
