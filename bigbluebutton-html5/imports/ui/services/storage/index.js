import Local from './local';
import Session from './session';

let StorageSingleton = null;
export const getStorageSingletonInstance = () => {
  const APP_CONFIG = window.meetingClientSettings.public.app;

  if (!StorageSingleton) {
    StorageSingleton = APP_CONFIG.userSettingsStorage === 'local' ? Local : Session;
  }
  return StorageSingleton;
};

export default getStorageSingletonInstance;
