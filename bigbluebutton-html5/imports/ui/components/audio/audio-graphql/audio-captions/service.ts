import { unique } from 'radash';
import { setAudioCaptionEnable } from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { isLiveTranscriptionEnabled } from '/imports/ui/services/features';

const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
const PROVIDER = CONFIG.provider;
const LANGUAGES = CONFIG.language.available;

export const isAudioTranscriptionEnabled = () => isLiveTranscriptionEnabled();

export const isWebSpeechApi = () => PROVIDER === 'webspeech';

export const getSpeechVoices = () => {
  if (!isWebSpeechApi()) return LANGUAGES;

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
  Session.set('audioCaptions', value);
};

export const setSpeechLocale = (value: string, setUserSpeechLocale: (a: string, b: string) => void) => {
  setUserSpeechLocale(value, CONFIG.provider);
};

export const useFixedLocale = () => isAudioTranscriptionEnabled() && CONFIG.language.forceLocale;

export default {
  getSpeechVoices,
  isAudioTranscriptionEnabled,
  setSpeechLocale,
  setAudioCaptions,
  isWebSpeechApi,
  useFixedLocale,
};
