import { useMutation } from '@apollo/client';
import { USER_SET_MUTED } from '../mutations';
import logger from '/imports/startup/client/logger';

const useToggleVoice = () => {
  const [userSetMuted] = useMutation(USER_SET_MUTED);

  const toggleVoice = async (userId: string, muted: boolean) => {
    try {
      await userSetMuted({ variables: { muted, userId } });
    } catch (e) {
      logger.error('Error on trying to toggle muted');
    }
  };

  return toggleVoice;
};

export default useToggleVoice;
