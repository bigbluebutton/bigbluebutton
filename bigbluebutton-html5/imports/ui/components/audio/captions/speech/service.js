import _ from 'lodash';
import { Session } from 'meteor/session';
import { makeCall } from '/imports/ui/services/api';
import AudioService from '/imports/ui/components/audio/service';

const DEFAULT_LANGUAGE = 'pt-BR';
const ENABLED = Meteor.settings.public.app.enableAudioCaptions;
const THROTTLE_TIMEOUT = 2000;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined';

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

const pushAudioTranscript = (transcript, type) => makeCall('pushAudioTranscript', transcript, type);

const throttledTranscriptPush = _.throttle(pushAudioTranscript, THROTTLE_TIMEOUT, {
  leading: false,
  trailing: true,
});

const pushInterimTranscript = (transcript) => throttledTranscriptPush(transcript, 'interim');

const pushFinalTranscript = (transcript) => {
  throttledTranscriptPush.cancel();
  pushAudioTranscript(transcript, 'final');
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

export default {
  hasSpeechRecognitionSupport,
  initSpeechRecognition,
  pushInterimTranscript,
  pushFinalTranscript,
  getSpeech,
  setSpeech,
  isEnabled,
  isActive,
  getStatus,
};
