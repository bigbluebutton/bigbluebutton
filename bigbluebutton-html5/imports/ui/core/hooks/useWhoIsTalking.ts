import { useEffect } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';

const createUseWhoIsTalking = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);

  const setWhoIsTalkingState = (newState: Record<string, boolean>) => stateVar(newState);

  const setWhoIsTalkingLoading = (loading: boolean) => loadingVar(loading);

  const getWhoIsTalking = () => stateVar();

  const dispatchWhoIsTalkingUpdate = (data?: { userId: string; talking: boolean; }[]) => {
    if (countVar() === 0) return;

    if (!data) {
      stateVar({});
      return;
    }

    const newTalkingUsers = { ...getWhoIsTalking() };

    data.forEach((voice) => {
      const { userId, talking } = voice;

      // Delete the user key instead of setting it to false
      // to keep the state object small and easy to compare with isEqual
      if (!talking) {
        delete newTalkingUsers[userId];
        return;
      }

      newTalkingUsers[userId] = true;
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
