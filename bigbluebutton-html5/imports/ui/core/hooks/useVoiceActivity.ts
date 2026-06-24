import logger from '/imports/startup/client/logger';
import { VOICE_ACTIVITY, VoiceActivityResponse } from '/imports/ui/core/graphql/queries/voiceActivity';
import useDeduplicatedSubscription from './useDeduplicatedSubscription';

const useVoiceActivity = (skip = false) => {
  const {
    data,
    loading,
    error,
  } = useDeduplicatedSubscription<VoiceActivityResponse>(VOICE_ACTIVITY, { skip });

  if (error) {
    logger.error({
      logCode: 'voice_activity_stream_error',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, 'useVoiceActivity hook failed.');
  }

  return {
    error,
    loading,
    data: data?.user_voice_activity_stream,
  };
};

export default useVoiceActivity;
