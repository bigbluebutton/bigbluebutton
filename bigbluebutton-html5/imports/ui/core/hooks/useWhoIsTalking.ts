import { useEffect, useMemo } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';

const createUseWhoIsTalking = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);
  // Individual reactive vars per user for granular reactivity
  const userVars = new Map<string, ReturnType<typeof makeVar<boolean | undefined>>>();

  const setWhoIsTalkingState = (newState: Record<string, boolean>) => {
    stateVar(newState);
    // Update individual user vars
    Object.keys(newState).forEach((userId) => {
      let userVar = userVars.get(userId);
      if (!userVar) {
        userVar = makeVar<boolean | undefined>(newState[userId]);
        userVars.set(userId, userVar);
      } else if (userVar() !== newState[userId]) {
        userVar(newState[userId]);
      }
    });
    // Clear users no longer in the state
    userVars.forEach((userVar, userId) => {
      if (!(userId in newState) && userVar() !== undefined) {
        userVar(undefined);
      }
    });
  };

  const setWhoIsTalkingLoading = (loading: boolean) => loadingVar(loading);

  const getWhoIsTalking = () => stateVar();

  const dispatchWhoIsTalkingUpdate = (data?: { userId: string; talking: boolean; muted: boolean }[]) => {
    if (countVar() === 0) return;

    if (!data) {
      stateVar({});
      return;
    }

    const newTalkingUsers = { ...getWhoIsTalking() };

    data.forEach((voice) => {
      const { userId, talking, muted } = voice;

      // Delete the user key instead of setting it to false
      // to keep the state object small and easy to compare with isEqual
      if (!talking || muted) {
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

  function useWhoIsTalking(): { data: Record<string, boolean>; loading: boolean };
  function useWhoIsTalking(userId: string): { data: boolean | undefined; loading: boolean };
  function useWhoIsTalking(userId?: string): { data: Record<string, boolean> | boolean | undefined; loading: boolean } {
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

    // When userId is provided, subscribe only to that user's reactive var
    // Otherwise subscribe to the whole state
    // We always call useReactiveVar to respect rules of hooks
    const userSpecificVar = useMemo(() => {
      if (!userId) return makeVar<boolean | undefined>(undefined); // dummy var
      let userVar = userVars.get(userId);
      if (!userVar) {
        userVar = makeVar<boolean | undefined>(undefined);
        userVars.set(userId, userVar);
      }
      return userVar;
    }, [userId]);

    const dummyStateVar = useMemo(() => makeVar<Record<string, boolean>>({}), []);

    const specificUserTalking = useReactiveVar(userSpecificVar);
    const allTalkingUsers = useReactiveVar(userId ? dummyStateVar : stateVar);

    const data = userId ? specificUserTalking : allTalkingUsers;

    return {
      data,
      loading,
    };
  }

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
