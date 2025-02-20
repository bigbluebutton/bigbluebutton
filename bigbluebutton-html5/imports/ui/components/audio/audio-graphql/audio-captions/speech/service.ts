import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import { unique } from 'radash';
import { useIsAudioTranscriptionEnabled } from '../service';
import Session from '/imports/ui/services/storage/in-memory';

// Reason: SpeechRecognition is not in window type definition
// Fix based on: https://stackoverflow.com/questions/41740683/speechrecognition-and-speechsynthesis-in-typescript
/* eslint @typescript-eslint/no-explicit-any: 0 */
export const SpeechRecognitionAPI = (window as any).SpeechRecognition
|| (window as any).webkitSpeechRecognition;

export const generateId = () => `${Auth.userID}-${Date.now()}`;

export const hasSpeechRecognitionSupport = () => {
  const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
  const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;

  return typeof SpeechRecognitionAPI !== 'undefined'
  && VALID_ENVIRONMENT;
};

export const setSpeechVoices = () => {
  if (!hasSpeechRecognitionSupport()) return;

  Session.setItem('speechVoices', unique(window.speechSynthesis.getVoices().map((v) => v.lang)));
};

export const useFixedLocale = () => {
  const FORCE_LOCALE = window.meetingClientSettings.public.app.audioCaptions.language.forceLocale;
  return useIsAudioTranscriptionEnabled() && FORCE_LOCALE;
};

export const localeAsDefaultSelected = () => {
  return window.meetingClientSettings.public.app.audioCaptions.language.defaultSelectLocale;
};

export const mostSimilarLanguage = (navigatorLanguage: string) => {
  const LANGUAGES = window.meetingClientSettings.public.app.audioCaptions.language.available;
  // First, check if there is an exact match in the available locales
  if (LANGUAGES.includes(navigatorLanguage)) {
    return navigatorLanguage;
  }

  // extracts only the language, without the region to find a match. "en-US" -> "en" for example
  const languageCode = navigatorLanguage.split('-')[0];

  // in case there is no similar language, falls back to the first available one
  let matchedLocale = LANGUAGES[0];
  LANGUAGES.forEach((locale) => {
    if (locale.startsWith(languageCode)) {
      matchedLocale = locale;
    }
  });

  return matchedLocale;
};

export const getLocale = (skipDisabled = false) => {
  const LOCALE = window.meetingClientSettings.public.app.audioCaptions.language.locale;

  if (LOCALE === 'browserLanguage') {
    return mostSimilarLanguage(navigator.language);
  }
  if (LOCALE === 'disabled') {
    if (skipDisabled) {
      return mostSimilarLanguage(navigator.language);
    }
    return '';
  }

  return LOCALE;
};

export const isLocaleValid = (locale: string) => {
  const LANGUAGES = window.meetingClientSettings.public.app.audioCaptions.language.available;
  return LANGUAGES.includes(locale);
};

export default {
  generateId,
  getLocale,
  localeAsDefaultSelected,
  useFixedLocale,
  setSpeechVoices,
  hasSpeechRecognitionSupport,
  isLocaleValid,
};
