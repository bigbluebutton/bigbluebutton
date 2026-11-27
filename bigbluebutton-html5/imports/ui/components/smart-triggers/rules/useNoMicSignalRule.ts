import { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useLocalAudioState from '../hooks/useLocalAudioState';
import useMicActivity from '/imports/ui/hooks/useMicActivity';
import { getSmartTriggersSettings, requestAudioSettings } from '../service';
import { CooldownPolicy } from '../types';

const intlMessages = defineMessages({
  message: {
    id: 'app.smartTriggers.noMicSignal.message',
    description: 'Hint shown when the unmuted microphone sends no sound',
  },
  changeMic: {
    id: 'app.smartTriggers.noMicSignal.action.changeMic',
    description: 'Action that opens the audio settings to pick another microphone',
  },
});

const SILENCE_CHECK_INTERVAL_MS = 1000;

const useNoMicSignalRule = () => {
  const intl = useIntl();
  const { afterSeconds, signalFloorDb, cooldownMs } = getSmartTriggersSettings().noMicSignal;
  const cooldown = useMemo<CooldownPolicy>(() => ({ kind: 'time', ms: cooldownMs }), [cooldownMs]);
  const {
    inputStream, isMuted, isListenOnly, isEchoTest, isConnected,
  } = useLocalAudioState();
  const { fire, clear } = useSmartTrigger('noMicSignal', cooldown);
  const [isSilent, setIsSilent] = useState(false);

  const watching = isConnected && !isListenOnly && !isMuted && !isEchoTest && !!inputStream;
  const { lastSignalAt } = useMicActivity(inputStream, {
    threshold: signalFloorDb,
    enabled: watching,
  });

  useEffect(() => {
    setIsSilent(false);
    if (!watching || !inputStream) return undefined;

    const watchingSince = Date.now();
    const [track] = inputStream.getAudioTracks();

    // A device that stops delivering audio is reported at once. Otherwise only a
    // microphone silent since it was unmuted or switched counts: once it sent
    // any signal it works, and a quiet room or noise suppression later on must
    // not read as a dead microphone.
    const check = () => {
      const deviceStopped = !!track && (track.muted || track.readyState === 'ended');
      const signalSeen = lastSignalAt.current > watchingSince;
      const silentTooLong = Date.now() - watchingSince >= afterSeconds * 1000;
      setIsSilent(deviceStopped || (!signalSeen && silentTooLong));
    };

    const silenceCheck = setInterval(check, SILENCE_CHECK_INTERVAL_MS);
    track?.addEventListener('mute', check);
    track?.addEventListener('unmute', check);
    track?.addEventListener('ended', check);
    check();

    return () => {
      clearInterval(silenceCheck);
      track?.removeEventListener('mute', check);
      track?.removeEventListener('unmute', check);
      track?.removeEventListener('ended', check);
    };
  }, [watching, inputStream, afterSeconds, lastSignalAt]);

  useEffect(() => {
    if (!isSilent) {
      clear();
      return;
    }
    fire({
      presentation: 'toast',
      icon: 'unmute',
      message: intl.formatMessage(intlMessages.message),
      actions: [{
        id: 'changeMic',
        label: intl.formatMessage(intlMessages.changeMic),
        onClick: requestAudioSettings,
      }],
    });
  }, [isSilent, fire, clear]);
};

export default useNoMicSignalRule;
