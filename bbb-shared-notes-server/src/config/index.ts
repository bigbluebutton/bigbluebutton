import fs from 'fs';
import { AppSettings } from './type';
import DEFAULT_SETTINGS from './const';

const DEFAULT_SETTINGS_FILE_PATH = './settings.json';
const LOCAL_SETTINGS_FILE_PATH = '/etc/bigbluebutton/shared-notes-server.json';

let settings: AppSettings = DEFAULT_SETTINGS

const localSettingsExists = () => {
  try {
    fs.accessSync(LOCAL_SETTINGS_FILE_PATH);
  } catch (err) {
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
  const SETTINGS = require(DEFAULT_SETTINGS_FILE_PATH);

  if (localSettingsExists()) {
    const LOCAL_SETTINGS = require(LOCAL_SETTINGS_FILE_PATH);
    mergeSettings(SETTINGS, LOCAL_SETTINGS);
    mergeSettings(SETTINGS, LOCAL_SETTINGS);
  }
  settings = SETTINGS;
}

const config = settings;

export { loadConfiguration, config };
