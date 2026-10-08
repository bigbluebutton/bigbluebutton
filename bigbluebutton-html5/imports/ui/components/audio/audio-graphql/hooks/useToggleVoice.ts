import { useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { USER_SET_MUTED } from '../mutations';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-participants/list-item/mutations';
import { restoreFromAway } from '../audio-controls/input-stream-live-selector/service';

const useToggleVoice = () => {
  const [userSetMuted] = useMutation(USER_SET_MUTED);
  const [setAway] = useMutation(SET_AWAY);
  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId, away: u.away }));
  const { userLocks } = useLockContext();

  // Read at call time: some callers keep the function from an older render
  // (e.g. the push-to-talk listeners)
  const selfStateRef = useRef({ userId: '', away: false, micLocked: false });
  selfStateRef.current = {
    userId: currentUser?.userId ?? '',
    away: currentUser?.away ?? false,
    micLocked: userLocks.userMic,
  };

  const toggleVoice = async (userId: string, muted: boolean) => {
    const { userId: currentUserId, away, micLocked } = selfStateRef.current;
    // Unmuting yourself means you are back, whatever control did it.
    // A locked microphone does not open, so the user stays away.
    if (!muted && away && !micLocked && userId === currentUserId) {
      restoreFromAway(toggleVoice);
      setAway({
        variables: {
          away: false,
        },
      });
    }

    try {
      await userSetMuted({ variables: { muted, userId } });
    } catch (e) {
      logger.error('Error on trying to toggle muted');
    }
  };

  return useCallback(toggleVoice, [userSetMuted, setAway]);
};

export default useToggleVoice;
