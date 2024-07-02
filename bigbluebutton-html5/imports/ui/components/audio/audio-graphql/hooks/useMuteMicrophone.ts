import { useCallback } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import useToggleVoice from './useToggleVoice';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';

const useMuteMicrophone = () => {
  const { data: currentUser } = useCurrentUser((u) => ({
    userId: u.userId,
  }));
  const toggleVoice = useToggleVoice();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const muted = currentUser?.userId && !unmutedUsers[currentUser?.userId];
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
