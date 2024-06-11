import { useCallback } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import useToggleVoice from './useToggleVoice';

const useMuteMicrophone = () => {
  const { data: currentUser } = useCurrentUser((u) => ({
    userId: u.userId,
    voice: {
      muted: u.voice?.muted,
    },
  }));
  const toggleVoice = useToggleVoice();
  const muted = !!currentUser?.voice?.muted;
  const userId = currentUser?.userId ?? '';

  return useCallback(() => {
    if (!muted) {
      logger.info({
        logCode: 'audiomanager_mute_audio',
        extraInfo: { logType: 'user_action' },
      }, 'User wants to leave conference. Microphone muted');
      AudioManager.setSenderTrackEnabled(false);
      toggleVoice(userId as string, true);
    }
  }, [muted, userId, toggleVoice]);
};

export default useMuteMicrophone;
