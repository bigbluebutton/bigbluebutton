import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

type Callback = () => void;

const useBreakoutExitObserver = () => {
  const [numberOfCurrentRooms, setNumberOfCurrentRooms] = useState<number>(0);
  const callbacks = useRef<Map<string, Callback>>(new Map());
  const oneTimeCallbacks = useRef<Callback[]>([]);

  const numberOfCurrentRoomsGql = useNumberOfCurrentRooms();

  useEffect(() => {
    if (numberOfCurrentRoomsGql !== numberOfCurrentRooms) {
      setNumberOfCurrentRooms((prevNumberOfCurrentRooms) => {
        if (numberOfCurrentRoomsGql === 0 && prevNumberOfCurrentRooms > 0) {
          callbacks.current.forEach((value) => value());
          oneTimeCallbacks.current.forEach((c) => c());
          oneTimeCallbacks.current = [];
        }
        return numberOfCurrentRoomsGql;
      });
    }
  }, [numberOfCurrentRoomsGql]);

  return useMemo(() => ({
    resetCallbacks: () => {
      callbacks.current = new Map();
      oneTimeCallbacks.current = [];
    },
    setCallback: (key: string, callback: Callback) => {
      callbacks.current.set(key, callback);
    },
    addOneTimeCallback: (callback: Callback) => {
      oneTimeCallbacks.current.push(callback);
    },
    removeCallback: (key: string) => {
      callbacks.current.delete(key);
    },
  }), []);
};

const useNumberOfCurrentRooms = () => {
  const { data: currentUser } = useCurrentUser((u) => ({
    breakoutRoomsSummary: u.breakoutRoomsSummary,
  }));

  return currentUser?.breakoutRoomsSummary?.totalOfIsUserCurrentlyInRoom ?? 0;
};

export {
  useBreakoutExitObserver,
};

export default {
  useBreakoutExitObserver,
};
