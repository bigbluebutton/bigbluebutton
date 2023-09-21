import React, { useCallback, useEffect, useRef } from 'react';
import {
  SpeechRecognitionAPI,
  generateId,
  initSpeechRecognition,
  isLocaleValid,
  updateFinalTranscript,
  updateInterimTranscript,
} from './service';
import logger from '/imports/startup/client/logger';
import { useReactiveVar } from '@apollo/client';
import AudioManager from '/imports/ui/services/audio-manager';
import { useCurrentUser } from '/imports/ui/core/hooks/useCurrentUser';

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
      updateFinalTranscript(id, transcript, locale);
      resultRef.current.id = generateId();
    } else {
      updateInterimTranscript(id, transcript, locale);
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

  const currentUser = useCurrentUser(
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
