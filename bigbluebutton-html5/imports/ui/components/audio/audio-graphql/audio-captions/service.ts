import { unique } from 'radash';
import { setAudioCaptionEnable } from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { useIsLiveTranscriptionEnabled } from '/imports/ui/services/features';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { Caption } from './live/queries';
import Session from '/imports/ui/services/storage/in-memory';
import { hasSpeechRecognitionSupport } from './speech/service';

export const captionLimit = () => {
  const CAPTIONS_CONFIG = window.meetingClientSettings.public.captions;
  return CAPTIONS_CONFIG.captionLimit;
};

export const splitTranscript = (obj: Caption) => {
  const CAPTIONS_CONFIG = window.meetingClientSettings.public.captions;
  const CHARACTERS_PER_LINE = CAPTIONS_CONFIG.lineLimit;
  const LINES_PER_MESSAGE = CAPTIONS_CONFIG.lines;

  const transcripts = [];
  const words = obj.captionText.split(' ');

  let currentLine = '';
  let result = '';

  // eslint-disable-next-line no-restricted-syntax
  for (const word of words) {
    if ((currentLine + word).length <= CHARACTERS_PER_LINE) {
      currentLine += `${word} `;
    } else {
      result += `${currentLine.trim()}\n`;
      currentLine = `${word} `;
    }

    if (result.split('\n').length > LINES_PER_MESSAGE) {
      transcripts.push(result);
      result = '';
    }
  }

  if (result.length) {
    transcripts.push(result);
  }
  transcripts.push(currentLine.trim());

  let i = 0;
  return transcripts.map((t) => {
    i += 1;

    return {
      ...obj,
      captionText: t,
      // if messages where split the captions will have a 'part' id
      captionId: `${obj.captionId}-${i}`,
    };
  });
};

export const useIsAudioTranscriptionEnabled = () => useIsLiveTranscriptionEnabled();

const getSpeechProvider = () => {
  const PROVIDER = window.meetingClientSettings.public.app.audioCaptions.provider;
  return getFromUserSettings('bbb_transcription_provider', PROVIDER);
};

export const isWebSpeechApi = () => getSpeechProvider() === 'webspeech';
export const isGladia = () => getSpeechProvider() === 'gladia';

// Module-level cache so language availability is only checked once
let cachedTranscriptionLanguages: string[] | null = null;

/**
 * Checks whether a given language is supported for speech recognition
 * using the SpeechRecognition.available() static method.
 * Returns true if the API is unavailable (i.e. we cannot determine support).
 */
const isSpeechRecognitionLanguageSupported = (lang: string): boolean => {
  try {
    // @ts-ignore - SR types is not yet in the TS types
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;
    if (typeof SR.available === 'function') {
      return SR.available(lang);
    }
    // If SpeechRecognition.available() is not implemented in this browser,
    // fall back to assuming all languages are supported.
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Returns the list of languages available for speech recognition (transcription).
 * For the webspeech provider, each configured language is validated using the
 * SpeechRecognition.available() static method. The result is cached after the
 * first call so that language checks are only performed once.
 */
export const getAvailableTranscriptionLanguages = (): string[] | null => {
  const LANGUAGES: string[] = window.meetingClientSettings.public.app.audioCaptions.language.available;

  if (!isWebSpeechApi()) return LANGUAGES;
  if (!hasSpeechRecognitionSupport()) return null;

  if (cachedTranscriptionLanguages !== null) return cachedTranscriptionLanguages;

  cachedTranscriptionLanguages = unique(LANGUAGES).filter(isSpeechRecognitionLanguageSupported);

  return cachedTranscriptionLanguages;
};

export const setAudioCaptions = (value: boolean) => {
  setAudioCaptionEnable(value);
  // @ts-ignore - Exist while we have meteor in the project
  Session.setItem('audioCaptions', value);
};

export const setSpeechLocale = (value: string, setUserSpeechLocale: (a: string, b: string) => void) => {
  setUserSpeechLocale(value, getSpeechProvider());
};

// SpeechLocale or CaptionLocale
export const setUserLocaleProperty = (value: string, setUserLocaleCallback: (a: string, b: string) => void) => {
  const PROVIDER = window.meetingClientSettings.public.app.audioCaptions.provider;
  setUserLocaleCallback(value, PROVIDER);
};

export const useFixedLocale = () => {
  const FORCE_LOCALE = window.meetingClientSettings.public.app.audioCaptions.language.forceLocale;
  return useIsAudioTranscriptionEnabled() && FORCE_LOCALE;
};

export const getLocaleName = (locale: string) => {
  if (locale === '' || locale == null) {
    return '';
  }

  const languageNames = new Intl.DisplayNames([locale], {
    type: 'language',
  });
  return languageNames.of(locale);
};

export default {
  getAvailableTranscriptionLanguages,
  useIsAudioTranscriptionEnabled,
  setUserLocaleProperty,
  setSpeechLocale,
  setAudioCaptions,
  isWebSpeechApi,
  useFixedLocale,
  isGladia,
  splitTranscript,
  getLocaleName,
  captionLimit,
};
