import { useCallback } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import Auth from '/imports/ui/services/auth';
import { USER_SET_MUTED } from '../mutations';
import { USER_MUTED, UserMutedResponse } from '../queries';

const useToggleVoice = () => {
  const [userSetMuted] = useMutation(USER_SET_MUTED);
  const { data: userMutedData } = useSubscription<UserMutedResponse>(USER_MUTED);

  const toggleVoice = async (userId?: string | null, muted?: boolean | null) => {
    let shouldMute = muted;
    const userToMute = userId ?? Auth.userID;

    if (muted === undefined || muted === null) {
      const { user_voice } = userMutedData || {};
      const userData = user_voice && user_voice.find((u) => u.userId === userToMute);
      if (!userData) return;
      shouldMute = !userData.muted;
    }

    userSetMuted({ variables: { muted: shouldMute, userId: userToMute } });
  };

  return useCallback(toggleVoice, [userMutedData]);
};

export default useToggleVoice;
