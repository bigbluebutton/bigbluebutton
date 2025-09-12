import { unique } from 'radash';
import { setAudioCaptionEnable } from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { useIsLiveTranscriptionEnabled } from '/imports/ui/services/features';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { Caption } from './live/queries';
import Session from '/imports/ui/services/storage/in-memory';
import { hasSpeechRecognitionSupport } from './speech/service';

export const splitTranscript = (obj: Caption) => {
  const CAPTIONS_CONFIG = window.meetingClientSettings.public.captions;
  const CHARACTERS_PER_LINE = CAPTIONS_CONFIG.lineLimit;
  const LINES_PER_MESSAGE = CAPTIONS_CONFIG.lines;
  const CAPTION_LIMIT = CAPTIONS_CONFIG.captionLimit;

  let transcripts = [];
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

  // If there are more caption objects than CAPTION_LIMIT
  // just get the last N captions
  transcripts = transcripts.slice(-CAPTION_LIMIT);

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

export const getSpeechVoices = () => {
  const LANGUAGES = window.meetingClientSettings.public.app.audioCaptions.language.available;
  if (!isWebSpeechApi()) return LANGUAGES;
  if (!hasSpeechRecognitionSupport()) return null;

  return unique(
    window
      .speechSynthesis
      .getVoices()
      .map((v) => v.lang)
      .filter((v) => LANGUAGES.includes(v)),
  );
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
  getSpeechVoices,
  useIsAudioTranscriptionEnabled,
  setUserLocaleProperty,
  setSpeechLocale,
  setAudioCaptions,
  isWebSpeechApi,
  useFixedLocale,
  isGladia,
  splitTranscript,
  getLocaleName,
};
