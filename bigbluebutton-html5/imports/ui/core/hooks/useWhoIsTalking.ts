import { useEffect } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';
import { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/whoIsTalking';

const createUseWhoIsTalking = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);

  const setWhoIsTalkingState = (newState: Record<string, boolean>) => stateVar(newState);

  const setWhoIsTalkingLoading = (loading: boolean) => loadingVar(loading);

  const getWhoIsTalking = () => stateVar();

  const dispatchWhoIsTalkingUpdate = (data?: VoiceActivityResponse['user_voice_activity_stream']) => {
    if (countVar() === 0) return;

    if (!data) {
      stateVar({});
      return;
    }

    const newTalkingUsers: Record<string, boolean> = { ...getWhoIsTalking() };

    data.forEach((voice) => {
      const { userId, muted, talking } = voice;

      if (muted) {
        delete newTalkingUsers[userId];
        return;
      }

      newTalkingUsers[userId] = talking;
    });

    if (isEqual(getWhoIsTalking(), newTalkingUsers)) {
      return;
    }

    setWhoIsTalkingState(newTalkingUsers);
  };

  const useWhoIsTalkingConsumersCount = () => useReactiveVar(countVar);

  const useWhoIsTalking = () => {
    const talkingUsers = useReactiveVar(stateVar);
    const loading = useReactiveVar(loadingVar);

    useEffect(() => {
      countVar(countVar() + 1);
      return () => {
        countVar(countVar() - 1);
        if (countVar() === 0) {
          setWhoIsTalkingState({});
        }
      };
    }, []);

    return {
      data: talkingUsers,
      loading,
    };
  };

  return [
    useWhoIsTalking,
    useWhoIsTalkingConsumersCount,
    setWhoIsTalkingLoading,
    dispatchWhoIsTalkingUpdate,
  ] as const;
};

const [
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
  dispatchWhoIsTalkingUpdate,
] = createUseWhoIsTalking();

export {
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
  dispatchWhoIsTalkingUpdate,
};

export default useWhoIsTalking;
