import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';
// @ts-ignore - it has no types
import { diff } from '@mconf/bbb-diff';
// @ts-ignore - it has no types
import hark from 'hark';
import { useReactiveVar, useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { debounce } from '/imports/utils/debounce';
import {
  SpeechRecognitionAPI,
  generateId,
  getLocale,
  hasSpeechRecognitionSupport,
  isLocaleValid,
  localeAsDefaultSelected,
  mostSimilarLanguage,
  setSpeechVoices,
  useFixedLocale,
} from './service';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  isWebSpeechApi,
  setSpeechLocale,
  useIsAudioTranscriptionEnabled,
} from '../service';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import { SUBMIT_TEXT } from './mutations';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';
import { notify } from '/imports/ui/services/notification';

const intlMessages = defineMessages({
  microphoneAlertMessage: {
    id: 'app.audio.captions.speech.microphoneAlert.message',
    description: 'Alert when WebSpeech is active but audio energy is detected without transcription',
  },
  microphoneAlertHelpLabel: {
    id: 'app.audio.captions.speech.microphoneAlert.helpLabel',
    description: 'Label for the knowledge base link in the microphone alert toast',
  },
});

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
  inputStream: MediaStream | null;
}
const speechHasStarted = {
  started: false,
};

// Without a track the browser transcribes its own default microphone, which is not
// necessarily the one in use in the meeting
const getInputTrack = (stream: MediaStream | null): MediaStreamTrack | null => {
  const track = stream?.getAudioTracks()[0];

  // start() rejects a muted track just like an ended one
  return track?.readyState === 'live' && !track.muted ? track : null;
};
const AudioCaptionsSpeech: React.FC<AudioCaptionsSpeechProps> = ({
  locale,
  connected,
  muted,
  inputStream,
}) => {
  const intl = useIntl();
  const resultRef = useRef({
    id: generateId(),
    transcript: '',
    isFinal: true,
    lang: '',
  });

  const localeRef = useRef(locale);
  // start() also runs from handlers and timers set up in earlier renders
  const inputStreamRef = useRef(inputStream);
  inputStreamRef.current = inputStream;

  const speechRecognitionRef = useRef<ReturnType<typeof SpeechRecognitionAPI>>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const trackIdRef = useRef('');
  const hadTrackRef = useRef(false);
  const defaultDeviceLoggedRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const prevIdRef = useRef('');
  const prevTranscriptRef = useRef('');
  const lastTranscriptionAtRef = useRef<number>(0);
  const alertShownRef = useRef<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const harkInstanceRef = useRef<any>(null);
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      setSpeechLocale(mostSimilarLanguage(navigator.language), setUserSpeechLocale);
    }
  };

  const createSpeechRecognition = () => {
    const speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    return speechRecognition;
  };

  const initSpeechRecognition = () => {
    if (!isAudioTranscriptionEnabled) return null;

    if (!isWebSpeechApi()) {
      setDefaultLocale();
      return null;
    }

    if (!hasSpeechRecognitionSupport()) return null;

    setSpeechVoices();
    const speechRecognition = createSpeechRecognition();

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
    // The final result follows the last interim one within the debounce delay: a pending
    // interim update would be sent after the final one and shorten the caption again
    transcriptUpdate.cancel();
    captionSubmitText(id, transcript, locale, true);
  };

  const releaseTrack = () => {
    trackRef.current?.stop();
    trackRef.current = null;
  };

  const onEnd = useCallback(() => {
    logger.debug({
      logCode: 'captions_speech_recognition_ended',
    }, 'Captions speech recognition ended by browser');

    speechHasStarted.started = false;
    releaseTrack();
    if (connectedRef.current && !mutedRef.current) {
      logger.debug("Speech recognition ended by browser, but we're not muted. Restart it");
      const timeSinceLastStart = new Date().getTime() - lastStartedAt.current;
      if (timeSinceLastStart < 1000) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (connectedRef.current && !mutedRef.current) start(localeRef.current);
        }, 1000 - timeSinceLastStart);
      } else {
        start(localeRef.current);
      }
    }
  }, []);
  const onError = useCallback((event: SpeechRecognitionErrorEvent) => {
    if (isRestartRef.current && event.error === 'aborted') return;

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

    lastTranscriptionAtRef.current = Date.now();
    alertShownRef.current = false;

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

  const bindHandlers = () => {
    speechRecognitionRef.current.onend = () => onEnd();
    speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => onError(event);
    speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => onResult(event);
  };

  const unbindHandlers = () => {
    speechRecognitionRef.current.onend = null;
    speechRecognitionRef.current.onerror = null;
    speechRecognitionRef.current.onresult = null;
  };

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
      const track = getInputTrack(inputStreamRef.current);
      // A clone, as Chrome never ends a session whose track is stopped while it starts
      let clone = track ? track.clone() : null;
      try {
        resultRef.current.id = generateId();
        if (clone) {
          clone.enabled = true;
          try {
            // Browsers without MediaStreamTrack support in start() ignore the argument
            speechRecognitionRef.current.start(clone);
            hadTrackRef.current = true;
            defaultDeviceLoggedRef.current = false;
          } catch (error) {
            clone.stop();
            clone = null;
            // Not about the track, e.g. the previous session is still ending
            if (getInputTrack(inputStreamRef.current)) throw error;
          }
        }
        if (!clone) {
          // Once an instance had a track, Chrome goes on using that track for a start()
          // without one, and never starts if it has ended: the default device needs an
          // instance of its own
          if (hadTrackRef.current) {
            unbindHandlers();
            speechRecognitionRef.current.abort();
            speechRecognitionRef.current = createSpeechRecognition();
            speechRecognitionRef.current.lang = settedLocale;
            bindHandlers();
            hadTrackRef.current = false;
          }
          speechRecognitionRef.current.start();
          // Not on every restart, the browser ends an idle session every few seconds
          if (!defaultDeviceLoggedRef.current) {
            const inputTrack = inputStreamRef.current?.getAudioTracks()[0];
            logger.info({
              logCode: 'captions_speech_recognition_default_device',
              extraInfo: {
                inputStream: MediaStreamUtils.getMediaStreamLogData(inputStreamRef.current),
                trackReadyState: inputTrack?.readyState,
                trackMuted: inputTrack?.muted,
              },
            }, 'Captions speech recognition started on the browser default microphone');
            defaultDeviceLoggedRef.current = true;
          }
        }
        releaseTrack();
        trackRef.current = clone;
        trackIdRef.current = clone && track ? track.id : '';
        speechHasStarted.started = true;
        isRestartRef.current = false;
      } catch (event: unknown) {
        clone?.stop();
        onError(event as SpeechRecognitionErrorEvent);
      }
    }
  };

  useEffect(() => {
    speechRecognitionRef.current = initSpeechRecognition();

    return () => {
      clearTimeout(restartTimeoutRef.current);
      transcriptUpdate.cancel();

      if (speechRecognitionRef.current) {
        unbindHandlers();
        stop();
        speechRecognitionRef.current.abort();
      }

      speechHasStarted.started = false;
      releaseTrack();
    };
  }, []);

  useEffect(() => {
    if (speechRecognitionRef.current) bindHandlers();
  }, [speechRecognitionRef.current]);

  // Not the current values, so that mounting with audio already unmuted starts the recognition
  const connectedRef = useRef(false);
  const mutedRef = useRef(true);
  const isRestartRef = useRef(false);
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
        isRestartRef.current = true;
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

  useEffect(() => {
    const MICROPHONE_ALERT_CONFIG = window.meetingClientSettings.public.app.audioCaptions.microphoneAlert;
    const {
      enabled,
      interval,
      threshold,
      speakingThreshold,
      duration,
      helpLink,
    } = MICROPHONE_ALERT_CONFIG;

    if (
      !enabled
      || !isWebSpeechApi()
      || !hasSpeechRecognitionSupport()
      || !isAudioTranscriptionEnabled
      || locale === ''
      || muted
      || !connected
      || !inputStream
    ) {
      return () => {};
    }

    alertShownRef.current = false;

    harkInstanceRef.current = hark(inputStream, { interval, threshold });

    harkInstanceRef.current.on('speaking', () => {
      if (alertShownRef.current) return;
      if (speakingTimerRef.current) return;

      const speakingStartedAt = Date.now();
      speakingTimerRef.current = setTimeout(() => {
        if (alertShownRef.current) return;
        if (lastTranscriptionAtRef.current >= speakingStartedAt) return;

        alertShownRef.current = true;
        const message = intl.formatMessage(intlMessages.microphoneAlertMessage);
        const options: Record<string, unknown> = { autoClose: duration || false };
        if (helpLink) {
          options.helpLink = helpLink;
          options.helpLabel = intl.formatMessage(intlMessages.microphoneAlertHelpLabel);
        }
        notify(message, 'warning', 'warning', options);
      }, speakingThreshold);
    });

    harkInstanceRef.current.on('stopped_speaking', () => {
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
    });

    return () => {
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
      if (harkInstanceRef.current) {
        harkInstanceRef.current.stop();
        harkInstanceRef.current = null;
      }
    };
  }, [connected, muted, inputStream, locale, isAudioTranscriptionEnabled]);

  useEffect(() => {
    const track = getInputTrack(inputStream);

    // Microphone changed while transcribing, onEnd restarts on the current one
    if (speechHasStarted.started && (track?.id ?? '') !== trackIdRef.current) {
      logger.debug({
        logCode: 'captions_speech_recognition_input_changed',
        extraInfo: {
          inputStream: MediaStreamUtils.getMediaStreamLogData(inputStream),
        },
      }, 'Captions speech recognition restarting on the changed input stream');
      isRestartRef.current = true;
      stop();
    }
  }, [inputStream]);

  return null;
};

const AudioCaptionsSpeechContainer: React.FC = () => {
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore
  const inputStream = useReactiveVar(AudioManager._inputStream) as MediaStream | null;
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
      inputStream={inputStream}
    />
  );
};

export default AudioCaptionsSpeechContainer;
