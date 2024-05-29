import { unique } from 'radash';
import { setAudioCaptionEnable } from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { isLiveTranscriptionEnabled } from '/imports/ui/services/features';

export const isAudioTranscriptionEnabled = () => isLiveTranscriptionEnabled();

export const isWebSpeechApi = () => {
  const PROVIDER = window.meetingClientSettings.public.app.audioCaptions.provider;
  return PROVIDER === 'webspeech';
};

export const getSpeechVoices = () => {
  const LANGUAGES = window.meetingClientSettings.public.app.audioCaptions.language.available;

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
  const PROVIDER = window.meetingClientSettings.public.app.audioCaptions.provider;
  setUserSpeechLocale(value, PROVIDER);
};

export const useFixedLocale = () => {
  const FORCE_LOCALE = window.meetingClientSettings.public.app.audioCaptions.language.forceLocale;
  return isAudioTranscriptionEnabled() && FORCE_LOCALE;
};

export default {
  getSpeechVoices,
  isAudioTranscriptionEnabled,
  setSpeechLocale,
  setAudioCaptions,
  isWebSpeechApi,
  useFixedLocale,
};
