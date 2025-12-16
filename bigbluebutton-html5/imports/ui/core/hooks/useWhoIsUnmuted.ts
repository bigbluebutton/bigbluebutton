import { useEffect } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';

const createUseWhoIsUnmuted = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);

  const setWhoIsUnmutedState = (newState: Record<string, boolean>) => stateVar(newState);

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

  const useWhoIsUnmuted = () => {
    const unmutedUsers = useReactiveVar(stateVar);
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

    return {
      data: unmutedUsers,
      loading,
    };
  };

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
