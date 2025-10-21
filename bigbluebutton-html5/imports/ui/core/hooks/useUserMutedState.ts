import logger from '/imports/startup/client/logger';
import { USER_MUTED, UserMutedResponse } from '/imports/ui/core/graphql/queries/userMuted';
import useDeduplicatedSubscription from './useDeduplicatedSubscription';

const useUserMutedState = (skip = false) => {
  const {
    data,
    loading,
    error,
  } = useDeduplicatedSubscription<UserMutedResponse>(USER_MUTED, { skip });

  if (error) {
    logger.error({
      logCode: 'user_muted_state_stream_error',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, 'useUserMutedState hook failed.');
  }

  return {
    error,
    loading,
    data: data?.user_voice_activity_stream,
  };
};

export default useUserMutedState;
