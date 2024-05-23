import { useEffect, useMemo, useState } from 'react';
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
  const source = useMemo(() => {
    const actualStorage = storage ?? APP_CONFIG.userSettingsStorage;
    const source = actualStorage === 'local' ? Local : Session;
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
};

export default {
  useStorageKey,
};
