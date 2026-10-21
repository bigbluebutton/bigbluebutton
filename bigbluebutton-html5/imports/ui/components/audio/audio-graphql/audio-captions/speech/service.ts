import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import { unique } from 'radash';
import { useIsAudioTranscriptionEnabled } from '../service';
import Session from '/imports/ui/services/storage/in-memory';
import logger from '/imports/startup/client/logger';

// Reason: SpeechRecognition is not in window type definition
// Fix based on: https://stackoverflow.com/questions/41740683/speechrecognition-and-speechsynthesis-in-typescript
/* eslint @typescript-eslint/no-explicit-any: 0 */
export const SpeechRecognitionAPI = (window as any).SpeechRecognition
|| (window as any).webkitSpeechRecognition;

export const generateId = () => `${Auth.userID}-${Date.now()}`;

export const isProcessLocally = () => (
  window.meetingClientSettings.public.app.audioCaptions.processLocally === true
);

// On-device recognition (Chrome 139+) exposes the static available() and install()
const hasOnDeviceSupport = () => typeof SpeechRecognitionAPI?.available === 'function'
  && typeof SpeechRecognitionAPI?.install === 'function';

export const hasSpeechRecognitionSupport = () => {
  const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
  const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;

  return typeof SpeechRecognitionAPI !== 'undefined'
  && typeof window.speechSynthesis !== 'undefined'
  && (!isProcessLocally() || hasOnDeviceSupport())
  && VALID_ENVIRONMENT;
};

type OnDeviceAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export const isOnDeviceLanguageSupported = async (locale: string) => {
  try {
    const availability: OnDeviceAvailability = await SpeechRecognitionAPI.available({
      langs: [locale],
      processLocally: true,
    });
    return availability !== 'unavailable';
  } catch (error) {
    return false;
  }
};

const onDeviceLanguages = new Map<string, Promise<boolean>>();

// Resolves once the language pack is on the device, downloading it the first time. Without
// it a session with processLocally fails with language-not-supported.
export const prepareOnDeviceLanguage = (locale: string): Promise<boolean> => {
  const pending = onDeviceLanguages.get(locale);
  if (pending) return pending;

  const preparation = (async () => {
    const options = { langs: [locale], processLocally: true };
    const availability: OnDeviceAvailability = await SpeechRecognitionAPI.available(options);
    if (availability === 'available') return true;
    if (availability === 'unavailable') return false;

    logger.info({
      logCode: 'captions_speech_recognition_language_pack_install',
      extraInfo: { locale, availability },
    }, 'Installing the on-device speech recognition language pack');
    const installed: boolean = await SpeechRecognitionAPI.install(options);
    return installed;
  })().catch((error) => {
    logger.error({
      logCode: 'captions_speech_recognition_language_pack_error',
      extraInfo: { locale, errorMessage: error?.message },
    }, 'Could not prepare the on-device speech recognition language pack');
    return false;
  }).then((ready) => {
    // A failed attempt is not cached, so that the next start tries again
    if (!ready) onDeviceLanguages.delete(locale);
    return ready;
  });

  onDeviceLanguages.set(locale, preparation);
  return preparation;
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
  isProcessLocally,
  isOnDeviceLanguageSupported,
  prepareOnDeviceLanguage,
  getLocale,
  localeAsDefaultSelected,
  useFixedLocale,
  setSpeechVoices,
  hasSpeechRecognitionSupport,
  isLocaleValid,
};
