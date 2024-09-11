import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useSubscription } from '@apollo/client';
import { GetIsUserCurrentlyInBreakoutRoomResponse, getIsUserCurrentlyInBreakoutRoom } from '../../breakout-room/breakout-room/queries';

type BreakoutCount = GetIsUserCurrentlyInBreakoutRoomResponse;
type Callback = () => void;

const useBreakoutExitObserver = () => {
  const [numberOfCurrentRooms, setNumberOfCurrentRooms] = useState<number>(0);
  const [observing, setObserving] = useState(false);
  const callbacks = useRef<Map<string, Callback>>(new Map());
  const oneTimeCallbacks = useRef<Callback[]>([]);
  const { data: userIsCurrentlyInBreakoutRoomData } = useSubscription<BreakoutCount>(
    getIsUserCurrentlyInBreakoutRoom,
    { skip: !observing },
  );
  const numberOfCurrentRoomsGql = userIsCurrentlyInBreakoutRoomData?.breakoutRoom_aggregate.aggregate.count ?? 0;

  useEffect(() => {
    if (numberOfCurrentRoomsGql !== numberOfCurrentRooms) {
      setNumberOfCurrentRooms((prevNumberOfCurrentRooms) => {
        if (numberOfCurrentRoomsGql === 0 && prevNumberOfCurrentRooms > 0) {
          callbacks.current.forEach((value) => value());
          oneTimeCallbacks.current.forEach((c) => c());
          oneTimeCallbacks.current = [];
          if (callbacks.current.size === 0) {
            setObserving(false);
          }
        }
        return numberOfCurrentRoomsGql;
      });
    }
  }, [numberOfCurrentRoomsGql]);

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
