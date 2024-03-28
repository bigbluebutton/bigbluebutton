import { unique } from 'radash';
import logger from '/imports/startup/client/logger';
import { setAudioCaptionEnable } from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { isLiveTranscriptionEnabled } from '/imports/ui/services/features';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { Caption } from './live/queries';

const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
const LANGUAGES = CONFIG.language.available;
const CAPTIONS_CONFIG = window.meetingClientSettings.public.captions;
const CHARACTERS_PER_LINE = CAPTIONS_CONFIG.lineLimit;
const LINES_PER_MESSAGE = CAPTIONS_CONFIG.lines;

export const splitTranscript = (obj: Caption) => {
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

  return transcripts.map((t) => { return { ...obj, captionText: t }; });
};

export const isAudioTranscriptionEnabled = () => isLiveTranscriptionEnabled();

const getSpeechProvider = () => {
  return getFromUserSettings('bbb_transcription_provider', CONFIG.provider);
};

export const isWebSpeechApi = () => getSpeechProvider() === 'webspeech';
const isGladia = () => getSpeechProvider() === 'gladia';

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

  if (voices.includes(value) || value === '' || (value === 'auto' && isGladia())) {
    setUserSpeechLocale(value, getSpeechProvider());
  } else {
    logger.error({
      logCode: 'captions_speech_locale',
    }, 'Captions speech set locale error');
  }
};

export const useFixedLocale = () => isAudioTranscriptionEnabled() && CONFIG.language.forceLocale;

export const isAudioTranscription = (c: Caption) => c.captionType === 'AUDIO_TRANSCRIPTION';

export default {
  getSpeechVoices,
  isAudioTranscriptionEnabled,
  setSpeechLocale,
  setAudioCaptions,
  isWebSpeechApi,
  useFixedLocale,
  isGladia,
  splitTranscript,
  isAudioTranscription,
};
