import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import AudioService from '/imports/ui/components/audio/service';
import deviceInfo from '/imports/utils/deviceInfo';
import { isLiveTranscriptionEnabled } from '/imports/ui/services/features';
import { unique } from 'radash';

const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
const ENABLED = CONFIG.enabled;
const PROVIDER = CONFIG.provider;
const LANGUAGES = CONFIG.language.available;
const VALID_ENVIRONMENT = !deviceInfo.isMobile || CONFIG.mobile;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined'
  && typeof window.speechSynthesis !== 'undefined'
  && VALID_ENVIRONMENT;

const setSpeechVoices = () => {
  if (!hasSpeechRecognitionSupport()) return;

  Session.set('speechVoices', unique(window.speechSynthesis.getVoices().map((v) => v.lang)));
};

// Trigger getVoices
setSpeechVoices();

const getSpeechVoices = () => {
  if (!isWebSpeechApi()) return LANGUAGES;

  const voices = Session.get('speechVoices') || [];
  return voices.filter((v) => LANGUAGES.includes(v));
};

const setSpeechLocale = (value, setUserSpeechLocale) => {
  const voices = getSpeechVoices();

  if (voices.includes(value) || value === '') {
    setUserSpeechLocale(value, CONFIG.provider);
  } else {
    logger.error({
      logCode: 'captions_speech_locale',
    }, 'Captions speech set locale error');
  }
};

const useFixedLocale = () => isEnabled() && CONFIG.language.forceLocale;

const initSpeechRecognition = (setUserSpeechLocale) => {
  if (!isEnabled() || !isWebSpeechApi()) return null;
  if (hasSpeechRecognitionSupport()) {
    // Effectivate getVoices
    setSpeechVoices();
    const speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    if (useFixedLocale() || localeAsDefaultSelected()) {
      setSpeechLocale(getLocale(), setUserSpeechLocale);
    } else {
      setSpeechLocale(navigator.language, setUserSpeechLocale);
    }

    return speechRecognition;
  }

  logger.warn({
    logCode: 'captions_speech_unsupported',
  }, 'Captions speech unsupported');

  return null;
};

const getSpeechLocale = (userId = Auth.userID) => {
  const user = Users.findOne({ userId }, { fields: { speechLocale: 1 } });

  if (user) return user.speechLocale;

  return '';
};

const hasSpeechLocale = (userId = Auth.userID) => getSpeechLocale(userId) !== '';

const isLocaleValid = (locale) => LANGUAGES.includes(locale);

const isEnabled = () => isLiveTranscriptionEnabled();

const isWebSpeechApi = () => PROVIDER === 'webspeech';

const isVosk = () => PROVIDER === 'vosk';

const isWhispering = () => PROVIDER === 'whisper';

const isDeepSpeech = () => PROVIDER === 'deepSpeech'

const isActive = () => isEnabled() && ((isWebSpeechApi() && hasSpeechLocale()) || isVosk() || isWhispering() || isDeepSpeech());

const getStatus = () => {
  const active = isActive();
  const locale = getSpeechLocale();
  const audio = AudioService.isConnected() && !AudioService.isEchoTest() && !AudioService.isMuted();
  const connected = Meteor.status().connected && active && audio;
  const talking = AudioService.isTalking();

  return {
    locale,
    connected,
    talking,
  };
};

const generateId = () => `${Auth.userID}-${Date.now()}`;

const localeAsDefaultSelected = () => CONFIG.language.defaultSelectLocale;

const getLocale = () => {
  const { locale } = CONFIG.language;
  if (locale === 'browserLanguage') return navigator.language;
  if (locale === 'disabled') return '';
  return locale;
};

const stereoUnsupported = () => isActive() && isVosk() && !!getSpeechLocale();

export default {
  LANGUAGES,
  hasSpeechRecognitionSupport,
  initSpeechRecognition,
  getSpeechVoices,
  getSpeechLocale,
  setSpeechLocale,
  hasSpeechLocale,
  isLocaleValid,
  isEnabled,
  isActive,
  getStatus,
  generateId,
  useFixedLocale,
  stereoUnsupported,
};
