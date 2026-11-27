import { useEffect, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import useMicActivity from '/imports/ui/hooks/useMicActivity';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useLocalAudioState from '../hooks/useLocalAudioState';
import { getSmartTriggersSettings } from '../service';
import { lastTranscriptionAt, speechRecognitionActive } from '../signals';
import { CooldownPolicy, HintAction } from '../types';

const intlMessages = defineMessages({
  message: {
    id: 'app.audio.captions.speech.microphoneAlert.message',
    description: 'Alert when WebSpeech is active but audio energy is detected without transcription',
  },
  helpLabel: {
    id: 'app.audio.captions.speech.microphoneAlert.helpLabel',
    description: 'Label for the knowledge base link in the microphone alert toast',
  },
});

// Shown once until something gets transcribed (shownAt), so the hint itself
// needs no cooldown.
const COOLDOWN: CooldownPolicy = { kind: 'time', ms: 0 };

const useSpeechNotTranscribedRule = () => {
  const intl = useIntl();
  const {
    speechThresholdDb, afterSpeakingSeconds, hideAfterMs, helpLink,
  } = getSmartTriggersSettings().speechNotTranscribed;
  const { fire, clear } = useSmartTrigger('speechNotTranscribed', COOLDOWN);
  const {
    inputStream, isMuted, isListenOnly, isEchoTest, isConnected,
  } = useLocalAudioState();
  const transcribing = useReactiveVar(speechRecognitionActive);
  const shownAt = useRef(0);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  const watching = transcribing && isConnected && !isListenOnly && !isMuted && !isEchoTest && !!inputStream;
  const { isSpeaking } = useMicActivity(inputStream, {
    threshold: speechThresholdDb,
    enabled: watching,
  });

  useEffect(() => () => clearTimeout(hideTimeout.current), []);

  useEffect(() => {
    if (!watching || !isSpeaking) return undefined;

    const speakingSince = Date.now();
    const speakingCheck = setTimeout(() => {
      const transcribedAt = lastTranscriptionAt();
      if (transcribedAt >= speakingSince || shownAt.current > transcribedAt) return;

      const actions: HintAction[] = [];
      if (helpLink) {
        actions.push({
          id: 'learnMore',
          label: intl.formatMessage(intlMessages.helpLabel),
          onClick: () => window.open(helpLink, '_blank', 'noopener,noreferrer'),
        });
      }
      const shown = fire({
        presentation: 'toast',
        icon: 'warning',
        message: intl.formatMessage(intlMessages.message),
        actions,
      });
      if (!shown) return;

      shownAt.current = Date.now();
      clearTimeout(hideTimeout.current);
      if (hideAfterMs > 0) hideTimeout.current = setTimeout(clear, hideAfterMs);
    }, afterSpeakingSeconds * 1000);

    return () => clearTimeout(speakingCheck);
  }, [watching, isSpeaking, afterSpeakingSeconds]);
};

export default useSpeechNotTranscribedRule;
