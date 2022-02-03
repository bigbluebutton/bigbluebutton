import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';

const DEFAULT_LANGUAGE = 'en-US';
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

const pushSpeechTranscript = (locale, transcript, type) => makeCall('pushSpeechTranscript', locale, transcript, type);

const throttledTranscriptPush = _.throttle(pushSpeechTranscript, THROTTLE_TIMEOUT, {
  leading: false,
  trailing: true,
});

const pushInterimTranscript = (locale, transcript) => throttledTranscriptPush(locale, transcript, 'interim');

const pushFinalTranscript = (locale, transcript) => {
  throttledTranscriptPush.cancel();
  pushSpeechTranscript(locale, transcript, 'final');
};

export default {
  hasSpeechRecognitionSupport,
  initSpeechRecognition,
  pushInterimTranscript,
  pushFinalTranscript,
};
