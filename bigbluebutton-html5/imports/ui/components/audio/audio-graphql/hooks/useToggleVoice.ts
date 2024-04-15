import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import Auth from '/imports/ui/services/auth';
import { USER_SET_MUTED } from '../mutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const useToggleVoice = () => {
  const [userSetMuted] = useMutation(USER_SET_MUTED);
  const { data: currentUserData } = useCurrentUser((u) => ({
    voice: {
      muted: u.voice?.muted,
    },
  }));

  const toggleVoice = async (userId?: string | null, muted?: boolean | null) => {
    let shouldMute = muted;
    const userToMute = userId ?? Auth.userID;

    if (muted === undefined || muted === null) {
      const muted = currentUserData?.voice?.muted;
      shouldMute = !muted;
    }

    userSetMuted({ variables: { muted: shouldMute, userId: userToMute } });
  };

  return useCallback(toggleVoice, [currentUserData?.voice?.muted]);
};

export default useToggleVoice;
