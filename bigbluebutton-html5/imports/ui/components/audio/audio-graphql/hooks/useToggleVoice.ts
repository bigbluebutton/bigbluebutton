import { useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { USER_SET_MUTED } from '../mutations';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-participants/list-item/mutations';
import Storage from '/imports/ui/services/storage/session';
import { restoreFromAway } from '../audio-controls/input-stream-live-selector/service';

type ToggleVoiceOptions = {
  // False when the user did not ask for the change, e.g. a moderator's unmute.
  // Such an unmute does not end away.
  userAction?: boolean;
};

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

  const toggleVoice = async (
    userId: string,
    muted: boolean,
    { userAction = true }: ToggleVoiceOptions = {},
  ) => {
    const { userId: currentUserId, away, micLocked } = selfStateRef.current;
    const selfUnmute = !muted && userId === currentUserId;
    if (selfUnmute && userAction && away && !micLocked) {
      // An unmute the user asked for means they are back, whatever control
      // did it. A locked microphone does not open, so the user stays away.
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
      logger.error({
        logCode: 'audio_toggle_voice_failure',
        extraInfo: { errorMessage: (e as Error)?.message, muted, userAction },
      }, 'Error on trying to toggle muted');
      return;
    }

    if (selfUnmute && !userAction) {
      // Clear prevAwayMuted, or a later return from away would unmute a
      // microphone the user has muted since. Skipped on failure: the server
      // still has the user muted.
      Storage.setItem('prevAwayMuted', false);
    }
  };

  return useCallback(toggleVoice, [userSetMuted, setAway]);
};

export default useToggleVoice;
