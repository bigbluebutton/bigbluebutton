import Local from './local';
import ObservableStorage from './observable';
import Session from './session';

let StorageSingleton: ObservableStorage | null = null;
export const getStorageSingletonInstance = () => {
  const APP_CONFIG = window.meetingClientSettings.public.app;

  if (!StorageSingleton) {
    StorageSingleton = APP_CONFIG.userSettingsStorage === 'local' ? Local : Session;
  }
  return StorageSingleton;
};

export default getStorageSingletonInstance;
