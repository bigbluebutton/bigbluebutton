import { isEqual } from 'radash';
import createReactiveStateHook from './createReactiveStateHook';

const createUseWhoIsUnmutedGraphql = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    getState,
    setState,
  } = createReactiveStateHook<Record<string, boolean>>({});

  const dispatchWhoIsUnmutedUpdate = (data?: { userId: string; muted: boolean }[]) => {
    if (!data) {
      setState({});
      return;
    }

    const currentState = getState();
    const newUnmutedUsers = { ...currentState };

    data.forEach((voice) => {
      const { userId, muted } = voice;

      if (muted) {
        delete newUnmutedUsers[userId];
        return;
      }

      newUnmutedUsers[userId] = true;
    });

    if (!isEqual(currentState, newUnmutedUsers)) setState(newUnmutedUsers);
  };

  return {
    useWhoIsUnmutedGraphql: useData,
    useWhoIsUnmutedConsumersCount: useConsumersCount,
    setWhoIsUnmutedLoading: setLoading,
    dispatchWhoIsUnmutedUpdate,
  };
};

const {
  useWhoIsUnmutedGraphql,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
  dispatchWhoIsUnmutedUpdate,
} = createUseWhoIsUnmutedGraphql();

export {
  useWhoIsUnmutedGraphql,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
  dispatchWhoIsUnmutedUpdate,
};

export default useWhoIsUnmutedGraphql;
