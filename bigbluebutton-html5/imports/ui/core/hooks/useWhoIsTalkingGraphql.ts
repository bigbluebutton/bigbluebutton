import { isEqual } from 'radash';
import createReactiveStateHook from './createReactiveStateHook';

const createUseWhoIsTalkingGraphql = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    getState,
    setState,
  } = createReactiveStateHook<Record<string, boolean>>({});

  const dispatchWhoIsTalkingUpdate = (data?: { userId: string; talking: boolean; muted: boolean }[]) => {
    if (!data) {
      setState({});
      return;
    }

    const currentState = getState();
    const newTalkingUsers = { ...currentState };

    data.forEach((voice) => {
      const { userId, talking, muted } = voice;

      if (!talking || muted) {
        delete newTalkingUsers[userId];
        return;
      }

      newTalkingUsers[userId] = true;
    });

    if (!isEqual(currentState, newTalkingUsers)) setState(newTalkingUsers);
  };

  return {
    useWhoIsTalkingGraphql: useData,
    useWhoIsTalkingConsumersCount: useConsumersCount,
    setWhoIsTalkingLoading: setLoading,
    dispatchWhoIsTalkingUpdate,
  };
};

const {
  useWhoIsTalkingGraphql,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
  dispatchWhoIsTalkingUpdate,
} = createUseWhoIsTalkingGraphql();

export {
  useWhoIsTalkingGraphql,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
  dispatchWhoIsTalkingUpdate,
};

export default useWhoIsTalkingGraphql;
