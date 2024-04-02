import { isAudioTranscriptionEnabled } from '../service';
import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import { unique } from 'radash';
// @ts-ignore - bbb-diff is not typed
import { diff } from '@mconf/bbb-diff';
import { Session } from 'meteor/session';
import { throttle } from '/imports/utils/throttle';
import { makeCall } from '/imports/ui/services/api';

const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
const LANGUAGES = CONFIG.language.available;
const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;
const THROTTLE_TIMEOUT = 2000;
// Reason: SpeechRecognition is not in window type definition
// Fix based on: https://stackoverflow.com/questions/41740683/speechrecognition-and-speechsynthesis-in-typescript
/* eslint @typescript-eslint/no-explicit-any: 0 */
export const SpeechRecognitionAPI = (window as any).SpeechRecognition
|| (window as any).webkitSpeechRecognition;

export const generateId = () => `${Auth.userID}-${Date.now()}`;

export const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined'
  && typeof window.speechSynthesis !== 'undefined'
  && VALID_ENVIRONMENT;

export const setSpeechVoices = () => {
  if (!hasSpeechRecognitionSupport()) return;

  Session.set('speechVoices', unique(window.speechSynthesis.getVoices().map((v) => v.lang)));
};

export const useFixedLocale = () => isAudioTranscriptionEnabled() && CONFIG.language.forceLocale;

export const localeAsDefaultSelected = () => CONFIG.language.defaultSelectLocale;

export const getLocale = () => {
  const { locale } = CONFIG.language;
  if (locale === 'browserLanguage') return navigator.language;
  if (locale === 'disabled') return '';
  return locale;
};

let prevId: string = '';
let prevTranscript: string = '';
const updateTranscript = (
  id: string,
  transcript: string,
  locale: string,
  isFinal: boolean,
) => {
  // If it's a new sentence
  if (id !== prevId) {
    prevId = id;
    prevTranscript = '';
  }

  const transcriptDiff = diff(prevTranscript, transcript);

  let start = 0;
  let end = 0;
  let text = '';
  if (transcriptDiff) {
    start = transcriptDiff.start;
    end = transcriptDiff.end;
    text = transcriptDiff.text;
  }

  // Stores current transcript as previous
  prevTranscript = transcript;

  makeCall('updateTranscript', id, start, end, text, transcript, locale, isFinal);
};

const throttledTranscriptUpdate = throttle(updateTranscript, THROTTLE_TIMEOUT, {
  leading: false,
  trailing: true,
});

export const updateInterimTranscript = (id: string, transcript: string, locale: string) => {
  throttledTranscriptUpdate(id, transcript, locale, false);
};

export const updateFinalTranscript = (id: string, transcript: string, locale: string) => {
  throttledTranscriptUpdate.cancel();
  updateTranscript(id, transcript, locale, true);
};

export const isLocaleValid = (locale: string) => LANGUAGES.includes(locale);

export default {
  generateId,
  getLocale,
  localeAsDefaultSelected,
  useFixedLocale,
  setSpeechVoices,
  hasSpeechRecognitionSupport,
  isLocaleValid,
};
