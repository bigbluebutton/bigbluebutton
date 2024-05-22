import { useEffect, useState } from 'react';
import Local from './local';
import Session from './session';
import { type StorageData } from './observable';

const APP_CONFIG = window.meetingClientSettings.public.app;

/**
 * Observer hook for a specific storage key.
 * @param key Key
 * @param storage Which storage to use. If omitted, `public.app.userSettingsStorage` will be used.
 * @returns Last key value.
 */
const useStorageKey = (key: string, storage?: 'local' | 'session') => {
  const [value, setValue] = useState<StorageData>();
  useEffect(() => {
    const actualStorage = storage ?? APP_CONFIG.userSettingsStorage;
    const source = actualStorage === 'local' ? Local : Session;
    const observer = (newValue: StorageData) => {
      setValue(newValue);
    };
    source.registerObserver(key, observer);
    return () => {
      source.revokeObserver(key, observer);
    };
  }, [storage, key]);
  return value;
};

export {
  useStorageKey,
};

export default {
  useStorageKey,
};
