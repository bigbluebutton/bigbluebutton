import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { USER_SET_MUTED } from '../mutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';

const useToggleVoice = () => {
  const [userSetMuted] = useMutation(USER_SET_MUTED);
  const { data: currentUserData } = useCurrentUser((u) => ({
    voice: {
      muted: u.voice?.muted,
    },
  }));

  const toggleVoice = async (userId: string, muted: boolean) => {
    try {
      await userSetMuted({ variables: { muted, userId } });
    } catch (e) {
      logger.error('Error on trying to toggle muted');
    }
  };

  return useCallback(toggleVoice, [currentUserData?.voice?.muted]);
};

export default useToggleVoice;
