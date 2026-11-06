import { isEqual } from 'radash';
import createReactiveRecordStateHook, {
  PerKeyDataResult,
  FullStateDataResult,
} from './createReactiveRecordStateHook';

type UseWhoIsUnmutedGraphqlHook = {
  (): FullStateDataResult;
  (userId: string): PerKeyDataResult;
  (userId?: string): FullStateDataResult | PerKeyDataResult;
};

const createUseWhoIsUnmutedGraphql = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    getState,
    setState,
  } = createReactiveRecordStateHook();

  // `retain` survives a reset: the stream replays only talking-or-unmuted users,
  // so anyone it omits has to be dropped here or they stay unmuted forever.
  const dispatchWhoIsUnmutedUpdate = (
    data?: { userId: string; muted: boolean }[],
    retain: string[] = [],
  ) => {
    if (!data) {
      const currentUnmuted = getState();
      const kept: Record<string, boolean> = {};

      retain.forEach((userId) => {
        if (currentUnmuted[userId]) kept[userId] = true;
      });
      setState(kept);

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
    useWhoIsUnmutedGraphql: useData as UseWhoIsUnmutedGraphqlHook,
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
