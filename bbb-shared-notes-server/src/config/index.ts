import fs from 'fs';
import { AppSettings } from './type';
import DEFAULT_SETTINGS from './const';

const DEFAULT_SETTINGS_FILE_PATH = process.env.NODE_ENV === 'production'
  ? '/usr/share/bbb-shared-notes-server/config/settings.json'
  : './src/config/settings.json';
const LOCAL_SETTINGS_FILE_PATH = '/etc/bigbluebutton/shared-notes-server.json';

let settings: AppSettings = DEFAULT_SETTINGS

const localSettingsExists = () => {
  try {
    fs.accessSync(LOCAL_SETTINGS_FILE_PATH);
  } catch {
    return false;
  }
  return true;
};

const mergeSettings = (target: any, source: any): any => {
  Object.keys(source).forEach(key => {
    if (Array.isArray(source[key])) {
      // Replace arrays instead of merging them
      target[key] = source[key];
    } else if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeSettings(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
};


function loadConfiguration() {
  const SETTINGS = JSON.parse(fs.readFileSync(DEFAULT_SETTINGS_FILE_PATH, 'utf-8'));

  if (localSettingsExists()) {
    const LOCAL_SETTINGS = JSON.parse(fs.readFileSync(LOCAL_SETTINGS_FILE_PATH, 'utf-8'));
    mergeSettings(SETTINGS, LOCAL_SETTINGS);
  }
  settings = SETTINGS;
}

const config = settings;

export { loadConfiguration, config };
