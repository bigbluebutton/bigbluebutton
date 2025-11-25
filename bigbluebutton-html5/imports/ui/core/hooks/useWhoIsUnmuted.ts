import { useEffect, useMemo } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';

const createUseWhoIsUnmuted = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);
  // Individual reactive vars per user for granular reactivity
  const userVars = new Map<string, ReturnType<typeof makeVar<boolean | undefined>>>();

  const setWhoIsUnmutedState = (newState: Record<string, boolean>) => {
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

  const setWhoIsUnmutedLoading = (loading: boolean) => loadingVar(loading);

  const getWhoIsUnmuted = () => stateVar();

  const dispatchWhoIsUnmutedUpdate = (data?: { userId: string; muted: boolean; }[]) => {
    if (countVar() === 0) return;

    if (!data) {
      stateVar({});
      return;
    }

    const newUnmutedUsers = { ...getWhoIsUnmuted() };

    data.forEach((voice) => {
      const { userId, muted } = voice;

      // Delete the user key instead of setting it to false
      // to keep the state object small and easy to compare with isEqual
      if (muted) {
        delete newUnmutedUsers[userId];
        return;
      }

      newUnmutedUsers[userId] = true;
    });

    if (isEqual(getWhoIsUnmuted(), newUnmutedUsers)) {
      return;
    }

    setWhoIsUnmutedState(newUnmutedUsers);
  };

  const useWhoIsUnmutedConsumersCount = () => useReactiveVar(countVar);

  function useWhoIsUnmuted(): { data: Record<string, boolean>; loading: boolean };
  function useWhoIsUnmuted(userId: string): { data: boolean | undefined; loading: boolean };
  function useWhoIsUnmuted(userId?: string): { data: Record<string, boolean> | boolean | undefined; loading: boolean } {
    const loading = useReactiveVar(loadingVar);

    useEffect(() => {
      countVar(countVar() + 1);
      return () => {
        countVar(countVar() - 1);
        if (countVar() === 0) {
          setWhoIsUnmutedState({});
        }
      };
    }, []);

    // When userId is provided, subscribe only to that user's reactive var
    // Otherwise subscribe to the whole state
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

    const specificUserUnmuted = useReactiveVar(userSpecificVar);
    const allUnmutedUsers = useReactiveVar(userId ? dummyStateVar : stateVar);

    const data = userId ? specificUserUnmuted : allUnmutedUsers;

    return {
      data,
      loading,
    };
  }

  return [
    useWhoIsUnmuted,
    useWhoIsUnmutedConsumersCount,
    setWhoIsUnmutedLoading,
    dispatchWhoIsUnmutedUpdate,
  ] as const;
};

const [
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
  dispatchWhoIsUnmutedUpdate,
] = createUseWhoIsUnmuted();

export {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
  dispatchWhoIsUnmutedUpdate,
};

export default useWhoIsUnmuted;
