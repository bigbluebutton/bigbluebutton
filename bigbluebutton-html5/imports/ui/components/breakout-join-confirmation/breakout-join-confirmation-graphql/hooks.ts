import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useSubscription } from '@apollo/client';
import { GetIfUserJoinedBreakoutRoomResponse, getIfUserJoinedBreakoutRoom } from '../../breakout-room/breakout-room/queries';

type BreakoutCount = GetIfUserJoinedBreakoutRoomResponse;
type Callback = () => void;

const useBreakoutExitObserver = () => {
  const [joinedRooms, setJoinedRooms] = useState<number>(0);
  const [observing, setObserving] = useState(false);
  const callbacks = useRef<Map<string, Callback>>(new Map());
  const oneTimeCallbacks = useRef<Callback[]>([]);
  const { data: userJoinedBreakoutData } = useSubscription<BreakoutCount>(
    getIfUserJoinedBreakoutRoom,
    { skip: !observing },
  );
  const userJoinedRooms = userJoinedBreakoutData?.breakoutRoom_aggregate.aggregate.count ?? 0;

  useEffect(() => {
    if (userJoinedRooms !== joinedRooms) {
      setJoinedRooms((prev) => {
        if (userJoinedRooms === 0 && prev > 0) {
          callbacks.current.forEach((value) => value());
          oneTimeCallbacks.current.forEach((c) => c());
          oneTimeCallbacks.current = [];
          if (callbacks.current.size === 0) {
            setObserving(false);
          }
        }
        return userJoinedRooms;
      });
    }
  }, [userJoinedRooms]);

  return useMemo(() => ({
    resetCallbacks: () => {
      callbacks.current = new Map();
      oneTimeCallbacks.current = [];
      setObserving(false);
    },
    setCallback: (key: string, callback: Callback) => {
      callbacks.current.set(key, callback);
      setObserving(true);
    },
    addOneTimeCallback: (callback: Callback) => {
      oneTimeCallbacks.current.push(callback);
      setObserving(true);
    },
    removeCallback: (key: string) => {
      callbacks.current.delete(key);
      if (callbacks.current.size === 0 && oneTimeCallbacks.current.length === 0) {
        setObserving(false);
      }
    },
  }), []);
};

export {
  useBreakoutExitObserver,
};

export default {
  useBreakoutExitObserver,
};
