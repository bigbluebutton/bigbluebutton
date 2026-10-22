import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import { useEffect } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import { unique } from 'radash';
import { isWebSpeechApi, useIsAudioTranscriptionEnabled } from '../service';
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
export const hasOnDeviceSupport = () => typeof SpeechRecognitionAPI?.available === 'function'
  && typeof SpeechRecognitionAPI?.install === 'function';

export const hasSpeechRecognitionSupport = () => {
  const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
  const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;

  return typeof SpeechRecognitionAPI !== 'undefined'
  && typeof window.speechSynthesis !== 'undefined'
  && (!isProcessLocally() || hasOnDeviceSupport())
  && VALID_ENVIRONMENT;
};

// What the browser reports through available(), plus the outcome of install(): checking until
// the first answer, failed when an install did not complete
export type OnDeviceLanguageStatus = 'checking' | 'unavailable' | 'downloadable' | 'downloading'
  | 'available' | 'failed';

const onDeviceLanguageStatus = makeVar<Record<string, OnDeviceLanguageStatus>>({});
const installing = new Set<string>();
const DOWNLOAD_POLL_INTERVAL = 2000;

const setOnDeviceLanguageStatus = (locale: string, status: OnDeviceLanguageStatus) => {
  onDeviceLanguageStatus({ ...onDeviceLanguageStatus(), [locale]: status });
};

export const getOnDeviceLanguageStatus = (locale: string) => onDeviceLanguageStatus()[locale];

export const checkOnDeviceLanguage = async (locale: string): Promise<void> => {
  if (installing.has(locale)) return;
  if (!getOnDeviceLanguageStatus(locale)) setOnDeviceLanguageStatus(locale, 'checking');

  try {
    const availability: OnDeviceLanguageStatus = await SpeechRecognitionAPI.available({
      langs: [locale],
      processLocally: true,
    });
    if (installing.has(locale)) return;
    setOnDeviceLanguageStatus(locale, availability);
    // Downloading on behalf of another tab or an earlier session: no promise to wait for
    if (availability === 'downloading') {
      setTimeout(() => checkOnDeviceLanguage(locale), DOWNLOAD_POLL_INTERVAL);
    }
  } catch (error) {
    setOnDeviceLanguageStatus(locale, 'unavailable');
  }
};

// Downloads the language pack, on a user's confirmation only: it is a few hundred MB, and
// Chrome gives no progress, so the UI can only tell that it is downloading. Resolves whether
// the language is on the device afterwards.
export const installOnDeviceLanguage = async (locale: string): Promise<boolean> => {
  if (installing.has(locale)) return false;
  installing.add(locale);
  setOnDeviceLanguageStatus(locale, 'downloading');
  logger.info({
    logCode: 'captions_speech_recognition_language_pack_install',
    extraInfo: { locale },
  }, 'Installing the on-device speech recognition language pack');

  let installed = false;
  try {
    installed = await SpeechRecognitionAPI.install({ langs: [locale], processLocally: true });
  } catch (error) {
    logger.error({
      logCode: 'captions_speech_recognition_language_pack_error',
      extraInfo: { locale, errorMessage: (error as Error)?.message },
    }, 'Could not install the on-device speech recognition language pack');
  }
  installing.delete(locale);
  setOnDeviceLanguageStatus(locale, installed ? 'available' : 'failed');
  return installed;
};

export const useOnDeviceLanguageStatus = (locale: string): OnDeviceLanguageStatus | undefined => {
  const statuses = useReactiveVar(onDeviceLanguageStatus);

  useEffect(() => {
    if (locale && isProcessLocally() && hasOnDeviceSupport()) checkOnDeviceLanguage(locale);
  }, [locale]);

  return statuses[locale];
};

// The transcription language just chosen in the audio settings, until the user's speechLocale
// has it: confirming right after choosing must go by the new choice, not the stale locale
export const chosenSpeechLocale = makeVar<string | null>(null);

// With processLocally, joining audio with a transcription language first downloads its language
// pack: needsDownload when confirming would start it, busy while it is checked or downloading.
// A language the browser cannot transcribe locally needs nothing: nothing would ever get it.
export const useOnDeviceLanguageForAudio = (locale: string, isTranscriptionEnabled: boolean) => {
  const onDevice = isTranscriptionEnabled && isWebSpeechApi() && isProcessLocally()
    && hasSpeechRecognitionSupport() && locale !== '';
  const status = useOnDeviceLanguageStatus(onDevice ? locale : '');

  return {
    needsDownload: onDevice && (status === 'downloadable' || status === 'failed'),
    busy: onDevice && (!status || status === 'checking' || status === 'downloading'),
  };
};

// The languages, out of the given ones, that can be transcribed on the device (downloaded or
// not). undefined until the browser has answered for all of them.
export const useOnDeviceLanguages = (locales: string[], enabled: boolean): string[] | undefined => {
  const statuses = useReactiveVar(onDeviceLanguageStatus);

  useEffect(() => {
    if (enabled) locales.forEach((locale) => checkOnDeviceLanguage(locale));
  }, [enabled, locales.join()]);

  if (!enabled) return undefined;
  if (locales.some((locale) => !statuses[locale] || statuses[locale] === 'checking')) return undefined;
  return locales.filter((locale) => statuses[locale] !== 'unavailable');
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
  checkOnDeviceLanguage,
  installOnDeviceLanguage,
  getOnDeviceLanguageStatus,
  useOnDeviceLanguageStatus,
  getLocale,
  localeAsDefaultSelected,
  useFixedLocale,
  setSpeechVoices,
  hasSpeechRecognitionSupport,
  isLocaleValid,
};
