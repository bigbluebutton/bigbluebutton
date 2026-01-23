import { isEqual } from 'radash';
import createReactiveRecordStateHook, {
  PerKeyDataResult,
  FullStateDataResult,
} from './createReactiveRecordStateHook';

type UseWhoIsUnmutedGraphqlHook = {
  (): FullStateDataResult;
  (userId: string): PerKeyDataResult;
};

const createUseWhoIsUnmutedGraphql = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    getState,
    setState,
  } = createReactiveRecordStateHook();

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
