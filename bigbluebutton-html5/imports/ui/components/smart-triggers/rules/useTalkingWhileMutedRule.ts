import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useLocalAudioState from '../hooks/useLocalAudioState';
import useMicActivity from '/imports/ui/hooks/useMicActivity';
import { getSmartTriggersSettings } from '../service';
import { CooldownPolicy } from '../types';

const intlMessages = defineMessages({
  tooltip: {
    id: 'app.muteWarning.tooltip',
    description: 'Tooltip message',
  },
});

const COOLDOWN: CooldownPolicy = { kind: 'untilReset' };

const useTalkingWhileMutedRule = () => {
  const intl = useIntl();
  const { speechThresholdDb, hideAfterMs } = getSmartTriggersSettings().talkingWhileMuted;
  const {
    inputStream, isMuted, isListenOnly, isConnected,
  } = useLocalAudioState();
  const { fire, clear, reset } = useSmartTrigger('talkingWhileMuted', COOLDOWN);

  const watching = isConnected && !isListenOnly && isMuted && !!inputStream;
  const { isSpeaking } = useMicActivity(inputStream, { threshold: speechThresholdDb, enabled: watching });

  useEffect(() => {
    if (!isMuted || !isConnected) reset();
  }, [isMuted, isConnected, reset]);

  useEffect(() => {
    if (!watching) {
      clear();
      return undefined;
    }
    if (isSpeaking) {
      fire({ presentation: 'anchored', message: intl.formatMessage(intlMessages.tooltip) });
      return undefined;
    }
    const hideTimer = setTimeout(clear, hideAfterMs);
    return () => clearTimeout(hideTimer);
  }, [watching, isSpeaking, hideAfterMs, fire, clear]);
};

export default useTalkingWhileMutedRule;
