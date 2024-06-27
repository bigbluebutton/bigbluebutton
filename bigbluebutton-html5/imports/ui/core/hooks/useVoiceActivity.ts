import { useEffect, useState } from 'react';
import logger from '/imports/startup/client/logger';
import VOICE_ACTIVITY, { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/whoIsTalking';
import useDeduplicatedSubscription from './useDeduplicatedSubscription';

type VoiceItem = VoiceActivityResponse['user_voice_activity_stream'][number] & {
  showTalkingIndicator: boolean | undefined;
};

const useVoiceActivity = () => {
  const {
    data,
    loading,
    error,
  } = useDeduplicatedSubscription<VoiceActivityResponse>(VOICE_ACTIVITY);
  const [record, setRecord] = useState<Record<string, VoiceItem>>({});

  if (error) {
    logger.error({
      logCode: 'voice_activity_sub_error',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, 'useVoiceActivity hook failed.');
  }

  useEffect(() => {
    const voiceActivity: Record<string, VoiceItem> = { ...record };

    if (data) {
      data.user_voice_activity_stream.forEach((voice) => {
        const { userId, muted } = voice;

        if (muted) {
          delete voiceActivity[userId];
          return;
        }

        voiceActivity[userId] = Object.assign(
          voiceActivity[userId] || {},
          voice,
        );
      });
    }

    setRecord(voiceActivity);
  }, [data]);

  return {
    error,
    loading,
    data: record,
  };
};

export default useVoiceActivity;
