import { useEffect, useMemo, useState } from 'react';
import Local from './local';
import Session from './session';
import InMemory from './in-memory';
import type { StorageData } from './observable';

const STORAGES = {
  LOCAL: 'local',
  SESSION: 'session',
  IN_MEMORY: 'in-memory',
} as const;

type Storage = typeof STORAGES;

/**
 * Observer hook for a specific storage key.
 * @param key Key
 * @param storage Which storage to use. The default is `in-memory`.
 * @returns Last key value.
 */
const useStorageKey = (key: string, storage?: Storage[keyof Storage]) => {
  const source = useMemo(() => {
    let source;
    switch (storage) {
      case STORAGES.LOCAL: {
        source = Local;
        break;
      }
      case STORAGES.SESSION: {
        source = Session;
        break;
      }
      case STORAGES.IN_MEMORY:
      default: {
        source = InMemory;
        break;
      }
    }
    return source;
  }, [storage]);
  const [value, setValue] = useState<StorageData>(source.getItem(key));
  useEffect(() => {
    const observer = (newValue: StorageData) => {
      setValue(newValue);
    };
    source.registerObserver(key, observer);
    return () => {
      source.revokeObserver(key, observer);
    };
  }, [source, key]);
  return value;
};

export {
  useStorageKey,
  STORAGES,
};

export default {
  useStorageKey,
  STORAGES,
};
