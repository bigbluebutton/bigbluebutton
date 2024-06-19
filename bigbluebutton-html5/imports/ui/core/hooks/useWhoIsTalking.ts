import WHO_IS_TALKING, { WhoIsTalkingResponse } from '/imports/ui/core/graphql/queries/whoIsTalking';
import logger from '/imports/startup/client/logger';
import { UserVoice } from '/imports/ui/Types/userVoice';
import useDeduplicatedSubscription from './useDeduplicatedSubscription';
import { useMemo } from 'react';
import { makePatchedQuery } from './createUseSubscription';

type UserId = string;

const PATCHED_WHO_IS_TALKING = makePatchedQuery(WHO_IS_TALKING);

const useWhoIsTalking = (filters?: {
  limit?: number;
  showTalkingIndicator?: boolean;
}) => {
  const {
    data,
    loading,
    error,
  } = useDeduplicatedSubscription<WhoIsTalkingResponse>(
    PATCHED_WHO_IS_TALKING,
  );

  if (error) {
    logger.error({
      logCode: 'who_is_talking_sub_error',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, 'useWhoIsTalking hook failed.');
  }

  const filteredVoices = useMemo(() => {
    const { user_voice = [] } = data || {};
    if (filters?.showTalkingIndicator) {
      return user_voice.filter((voice) => voice.showTalkingIndicator);
    }
    return user_voice;
  }, [data, filters?.showTalkingIndicator]);

  const limitedVoices = useMemo(() => {
    if (filters?.limit) {
      return filteredVoices.slice(0, filters.limit);
    }
    return filteredVoices;
  }, [filteredVoices, filters?.limit]);

  const voices: Record<UserId, Partial<UserVoice>> = {};
  limitedVoices.forEach((voice) => {
    voices[voice.userId!] = voice;
  });

  return {
    voices,
    loading,
    error,
  };
};

export default useWhoIsTalking;
