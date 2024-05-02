import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import { unique } from 'radash';
import { Session } from 'meteor/session';
import { isAudioTranscriptionEnabled } from '../service';

const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
const LANGUAGES = CONFIG.language.available;
const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;
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
