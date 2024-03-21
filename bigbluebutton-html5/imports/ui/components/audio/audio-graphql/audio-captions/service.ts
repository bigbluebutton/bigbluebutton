import { unique } from 'radash';
import logger from '/imports/startup/client/logger';
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
  const voices = getSpeechVoices();

  if (voices.includes(value) || value === '') {
    setUserSpeechLocale(value, CONFIG.provider);
  } else {
    logger.error({
      logCode: 'captions_speech_locale',
    }, 'Captions speech set locale error');
  }
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
