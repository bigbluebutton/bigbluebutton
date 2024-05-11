import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
// @ts-ignore - it's has no types
import { diff } from '@mconf/bbb-diff';
import { useReactiveVar, useMutation } from '@apollo/client';
import { throttle } from '/imports/utils/throttle';
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
import { isAudioTranscriptionEnabled, isWebSpeechApi, setSpeechLocale } from '../service';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { SUBMIT_TEXT } from './mutations';

const THROTTLE_TIMEOUT = 200;

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

type SpeechRecognitionErrorEvent = {
  error: string;
  message: string;
}

interface AudioCaptionsSpeechProps {
  locale: string;
  connected: boolean;
}
const speechHasStarted = {
  started: false,
};
const AudioCaptionsSpeech: React.FC<AudioCaptionsSpeechProps> = ({
  locale,
  connected,
}) => {
  const resultRef = useRef({
    id: generateId(),
    transcript: '',
    isFinal: true,
  });

  const idleRef = useRef(true);
  const speechRecognitionRef = useRef<ReturnType<typeof SpeechRecognitionAPI>>(null);
  const prevIdRef = useRef('');
  const prevTranscriptRef = useRef('');
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);

  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    setSpeechLocaleMutation({
      variables: {
        locale: speechLocale,
        provider,
      },
    });
  };

  const initSpeechRecognition = () => {
    if (!isAudioTranscriptionEnabled() && !isWebSpeechApi()) return null;

    if (!hasSpeechRecognitionSupport()) return null;

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

  const throttledTranscriptUpdate = useMemo(() => throttle(
    captionSubmitText, THROTTLE_TIMEOUT, {
      leading: false,
      trailing: true,
    },
  ), []);

  const updateFinalTranscript = (id: string, transcript: string, locale: string) => {
    throttledTranscriptUpdate.cancel();
    captionSubmitText(id, transcript, locale, true);
  };

  const onEnd = useCallback(() => {
    stop();
  }, []);
  const onError = useCallback((event: SpeechRecognitionErrorEvent) => {
    stop();
    logger.error({
      logCode: 'captions_speech_recognition',
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
    } = event;

    const { id } = resultRef.current;

    const { transcript } = results[resultIndex][0];
    const { isFinal } = results[resultIndex];

    resultRef.current.transcript = transcript;
    resultRef.current.isFinal = isFinal;

    if (isFinal) {
      throttledTranscriptUpdate(id, transcript, locale, true);
      resultRef.current.id = generateId();
    } else {
      throttledTranscriptUpdate(id, transcript, locale, false);
    }
  }, [locale]);

  const stop = useCallback(() => {
    idleRef.current = true;
    if (speechRecognitionRef.current) {
      const {
        isFinal,
        transcript,
      } = resultRef.current;

      if (!isFinal) {
        const { id } = resultRef.current;
        updateFinalTranscript(id, transcript, locale);
        speechRecognitionRef.current.abort();
      } else {
        speechRecognitionRef.current.stop();
        speechHasStarted.started = false;
      }
    }
  }, [locale]);

  const start = (settedLocale: string) => {
    if (speechRecognitionRef.current && isLocaleValid(settedLocale)) {
      speechRecognitionRef.current.lang = settedLocale;
      try {
        resultRef.current.id = generateId();
        speechRecognitionRef.current.start();
        idleRef.current = false;
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
  const localeRef = useRef(locale);
  useEffect(() => {
    // Connected
    if (!connectedRef.current && connected) {
      start(locale);
      connectedRef.current = connected;
    } else if (connectedRef.current && !connected) {
      // Disconnected
      stop();
      connectedRef.current = connected;
    } else if (localeRef.current !== locale) {
      // Locale changed
      if (connectedRef.current && connected) {
        stop();
        start(locale);
        localeRef.current = locale;
      }
    }
  }, [connected, locale]);

  return null;
};

const AudioCaptionsSpeechContainer: React.FC = () => {
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;

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
    />
  );
};

export default AudioCaptionsSpeechContainer;
