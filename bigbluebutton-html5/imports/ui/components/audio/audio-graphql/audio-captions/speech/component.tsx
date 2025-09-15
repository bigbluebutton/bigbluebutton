import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';
// @ts-ignore - it has no types
import { diff } from '@mconf/bbb-diff';
import { useReactiveVar, useMutation } from '@apollo/client';
import { debounce } from '/imports/utils/debounce';
import {
  SpeechRecognitionAPI,
  generateId,
  getLocale,
  hasSpeechRecognitionSupport,
  isLocaleValid,
  localeAsDefaultSelected,
  setSpeechVoices,
  useFixedLocale,
} from './service';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  isWebSpeechApi,
  setUserLocaleProperty,
  setSpeechLocale,
  useIsAudioTranscriptionEnabled,
} from '../service';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { SUBMIT_TEXT } from './mutations';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';

const THROTTLE_TIMEOUT = 200;

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResult[];
  target: Target;
}

type Target = {
  lang: string;
}

type SpeechRecognitionErrorEvent = {
  error: string;
  message: string;
}

interface AudioCaptionsSpeechProps {
  locale: string;
  connected: boolean;
  muted: boolean;
}
const speechHasStarted = {
  started: false,
};
const AudioCaptionsSpeech: React.FC<AudioCaptionsSpeechProps> = ({
  locale,
  connected,
  muted,
}) => {
  const resultRef = useRef({
    id: generateId(),
    transcript: '',
    isFinal: true,
    lang: '',
  });

  const localeRef = useRef(locale);

  const speechRecognitionRef = useRef<ReturnType<typeof SpeechRecognitionAPI>>(null);
  const prevIdRef = useRef('');
  const prevTranscriptRef = useRef('');
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const isAudioTranscriptionEnabled = useIsAudioTranscriptionEnabled();
  const fixedLocaleResult = useFixedLocale();

  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    if (speechLocale !== '') {
      setSpeechLocaleMutation({
        variables: {
          locale: speechLocale,
          provider,
        },
      });
    }
  };

  const setDefaultLocale = () => {
    if (fixedLocaleResult || localeAsDefaultSelected()) {
      setSpeechLocale(getLocale(), setUserSpeechLocale);
    } else {
      setSpeechLocale(navigator.language, setUserSpeechLocale);
    }
  };

  const initSpeechRecognition = () => {
    if (!isAudioTranscriptionEnabled) return null;

    if (!isWebSpeechApi()) {
      setDefaultLocale();
      return null;
    }

    if (!hasSpeechRecognitionSupport()) return null;

    setSpeechVoices();
    const speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    if (fixedLocaleResult || localeAsDefaultSelected()) {
      setUserLocaleProperty(getLocale(), setUserSpeechLocale);
    } else {
      setUserLocaleProperty(navigator.language, setUserSpeechLocale);
    }

    return speechRecognition;
  };

  const [submitText] = useMutation(SUBMIT_TEXT);
  const captionSubmitText = (
    id: string,
    transcript: string,
    locale: string,
    isFinal: boolean = false,
  ) => {
    // If it's a new sentence
    if (id !== prevIdRef.current) {
      prevIdRef.current = id;
      prevTranscriptRef.current = '';
    }

    const transcriptDiff = diff(prevTranscriptRef.current, transcript);

    let start = 0;
    let end = 0;
    let text = '';
    if (transcriptDiff) {
      start = transcriptDiff.start;
      end = transcriptDiff.end;
      text = transcriptDiff.text;
    }

    // Stores current transcript as previous
    prevTranscriptRef.current = transcript;

    submitText({
      variables: {
        transcriptId: id,
        start,
        end,
        text,
        transcript,
        locale,
        isFinal,
      },
    });
  };

  const transcriptUpdate = debounce(captionSubmitText, THROTTLE_TIMEOUT);

  const updateFinalTranscript = (id: string, transcript: string, locale: string) => {
    captionSubmitText(id, transcript, locale, true);
  };

  const onEnd = useCallback(() => {
    logger.debug({
      logCode: 'captions_speech_recognition_ended',
    }, 'Captions speech recognition ended by browser');

    speechHasStarted.started = false;
    if (!mutedRef.current) {
      logger.debug("Speech recognition ended by browser, but we're not muted. Restart it");
      const timeSinceLastStart = new Date().getTime() - lastStartedAt.current;
      if (timeSinceLastStart < 1000) {
        setTimeout(() => {
          start(localeRef.current);
        }, 1000 - timeSinceLastStart);
      } else {
        start(localeRef.current);
      }
    }
  }, []);
  const onError = useCallback((event: SpeechRecognitionErrorEvent) => {
    if (isLocaleChangeRef.current && event.error === 'aborted') return;

    // This error 'no-speech' is expected because speech recognition is set to automatically
    // restart whenever the browser stops it — tipically due to silence timeout. As a result,
    // while the user is unmuted, recognition will keep running even if they're silent and
    // there's nothing to transcribe.
    if (event.error === 'no-speech') return;

    logger.error({
      logCode: 'captions_speech_recognition_error',
      extraInfo: {
        error: event.error,
        message: event.message,
      },
    }, 'Captions speech recognition error');
  }, []);

  const onResult = useCallback((event: SpeechRecognitionEvent) => {
    const {
      resultIndex,
      results,
      target,
    } = event;

    logger.debug('Transcription event', resultIndex, results, target);

    const { id } = resultRef.current;

    const { transcript } = results[resultIndex][0];
    const { isFinal } = results[resultIndex];
    const { lang } = target;

    resultRef.current.transcript = transcript;
    resultRef.current.isFinal = isFinal;
    resultRef.current.lang = lang;

    if (isFinal) {
      updateFinalTranscript(id, transcript, lang);
      resultRef.current.id = generateId();
    } else {
      transcriptUpdate(id, transcript, lang, false);
    }
  }, [localeRef]);

  const stop = useCallback(() => {
    if (speechRecognitionRef.current) {
      logger.debug('Stopping browser speech recognition');
      if (!speechHasStarted.started) {
        return;
      }

      const {
        isFinal,
        transcript,
        lang,
      } = resultRef.current;

      if (!isFinal) {
        const { id } = resultRef.current;
        updateFinalTranscript(id, transcript, lang);
        resultRef.current.isFinal = true;
        speechRecognitionRef.current.abort();
      } else {
        speechRecognitionRef.current.stop();
      }
      speechHasStarted.started = false;
    }
  }, [localeRef]);

  const start = (settedLocale: string) => {
    if (speechRecognitionRef.current && isLocaleValid(settedLocale)) {
      logger.debug('Starting browser speech recognition for locale: ', settedLocale);
      speechRecognitionRef.current.lang = settedLocale;

      if (settedLocale !== localeRef.current) {
        localeRef.current = settedLocale;
      }

      if (speechHasStarted.started) {
        logger.warn('Already starting return');
        return;
      }

      lastStartedAt.current = new Date().getTime();
      try {
        resultRef.current.id = generateId();
        speechRecognitionRef.current.start();
        speechHasStarted.started = true;
        isLocaleChangeRef.current = false;
      } catch (event: unknown) {
        onError(event as SpeechRecognitionErrorEvent);
      }
    }
  };

  useEffect(() => {
    speechRecognitionRef.current = initSpeechRecognition();
  }, []);

  useEffect(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.onend = () => onEnd();
      speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => onError(event);
      speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => onResult(event);
    }
  }, [speechRecognitionRef.current]);

  const connectedRef = useRef(connected);
  const mutedRef = useRef(muted);
  const isLocaleChangeRef = useRef(false);
  const lastStartedAt = useRef<number>(0);

  useEffect(() => {
    // Disabled
    if (locale === '') {
      stop();
      connectedRef.current = false;
    } else if ((!connectedRef.current && connected && !muted)) {
      // Connected
      logger.debug('Audio connected');
      start(locale);
      connectedRef.current = connected;
    } else if (locale !== '' && localeRef.current !== locale) {
      logger.debug('Locale changed', locale);

      // Locale changed
      if (connectedRef.current && connected) {
        isLocaleChangeRef.current = true;
        stop();
        localeRef.current = locale;
      }
    }

    // Disconnected
    if ((connectedRef.current && !connected)) {
      logger.debug('Audio disconnected');
      stop();
      connectedRef.current = connected;
    }

    // Unmuted and connected
    if (mutedRef.current && !muted && connected) {
      logger.debug('Audio unmuted and connected');
      start(locale);
      mutedRef.current = muted;
    }

    // Muted
    if (!mutedRef.current && muted) {
      logger.debug('Audio muted');
      stop();
      mutedRef.current = muted;
    }
  }, [connected, muted, locale]);

  return null;
};

const AudioCaptionsSpeechContainer: React.FC = () => {
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  const isConnected = useIsAudioConnected();

  const {
    data: currentUser,
  } = useCurrentUser(
    (user) => ({
      speechLocale: user.speechLocale,
      voice: user.voice,
    }),
  );

  if (!currentUser) return null;

  return (
    <AudioCaptionsSpeech
      locale={currentUser.speechLocale ?? ''}
      connected={isConnected}
      muted={isMuted}
    />
  );
};

export default AudioCaptionsSpeechContainer;
