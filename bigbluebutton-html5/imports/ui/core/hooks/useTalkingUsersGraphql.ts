import { useMemo } from 'react';
import { VoiceUserMetadata } from './types';
import useTimedTalkingIndicator, { RawVoiceActivityItem } from './useTimedTalkingIndicator';
import createReactiveStateHook from './createReactiveStateHook';

type GraphQLVoiceActivityItem = {
  muted: boolean;
  talking: boolean;
  userId: string;
  voiceUserId: string;
  user: VoiceUserMetadata;
};

const createUseTalkingUsersGraphql = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    setState,
  } = createReactiveStateHook<GraphQLVoiceActivityItem[] | undefined>([]);

  const useTalkingUsersGraphql = () => {
    const { data: voiceActivity, loading } = useData();

    const rawVoiceActivity = useMemo<RawVoiceActivityItem[] | undefined>(() => {
      if (!voiceActivity) return undefined;

      return voiceActivity.map((voice) => ({
        userId: voice.userId,
        talking: voice.talking,
        muted: voice.muted,
        user: voice.user,
        voiceUserId: voice.voiceUserId,
      }));
    }, [voiceActivity]);

    const processedData = useTimedTalkingIndicator(rawVoiceActivity, !loading);

    return {
      error: undefined,
      loading,
      data: processedData,
    };
  };

  return {
    useTalkingUsersGraphql,
    useTalkingUserConsumersCount: useConsumersCount,
    dispatchTalkingUserUpdate: setState,
    setTalkingUserLoading: setLoading,
  };
};

const {
  useTalkingUsersGraphql,
  useTalkingUserConsumersCount,
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
} = createUseTalkingUsersGraphql();

export {
  useTalkingUserConsumersCount,
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
};

export default useTalkingUsersGraphql;
