import LocalStorage from '/imports/ui/services/storage/local';
import SessionStorage from '/imports/ui/services/storage/session';

import { isEmpty } from 'radash';

const APP_CONFIG = window.meetingClientSettings.public.app;

const SETTINGS = [
  'application',
  'audio',
  'video',
  'cc',
  'dataSaving',
  'animations',
  'selfViewDisable',
];

const CHANGED_SETTINGS = 'changed_settings';
const DEFAULT_SETTINGS = 'default_settings';

class Settings {
  constructor(defaultValues = {}) {
    const writableDefaultValues = JSON.parse(JSON.stringify(defaultValues));
    SETTINGS.forEach((p) => {
      const privateProp = `_${p}`;
      this[privateProp] = {
        tracker: new Tracker.Dependency(),
        value: undefined,
      };

      Object.defineProperty(this, p, {
        get: () => {
          this[privateProp].tracker.depend();
          return this[privateProp].value;
        },

        set: (v) => {
          this[privateProp].value = v;
          this[privateProp].tracker.changed();
        },
      });
    });
    this.defaultSettings = {};
    // Sets default locale to browser locale
    writableDefaultValues.application.locale = navigator.languages ? navigator.languages[0] : false
      || navigator.language
      || writableDefaultValues.application.locale;

    this.setDefault(writableDefaultValues);
    this.loadChanged();
  }

  setDefault(defaultValues) {
    Object.keys(defaultValues).forEach((key) => {
      this[key] = defaultValues[key];
      this.defaultSettings[`_${key}`] = defaultValues[key];
    });

    this.save(undefined, DEFAULT_SETTINGS);
  }

  loadChanged() {
    const Storage = (APP_CONFIG.userSettingsStorage === 'local') ? LocalStorage : SessionStorage;
    const savedSettings = {};

    SETTINGS.forEach((s) => {
      savedSettings[s] = Storage.getItem(`${CHANGED_SETTINGS}_${s}`);
    });

    Object.keys(savedSettings).forEach((key) => {
      const savedItem = savedSettings[key];
      if (!savedItem) return;
      this[key] = {
        ...this[key],
        ...savedItem,
      };
    });
  }

  save(mutation, settings = CHANGED_SETTINGS) {
    const Storage = (APP_CONFIG.userSettingsStorage === 'local') ? LocalStorage : SessionStorage;
    if (settings === CHANGED_SETTINGS) {
      Object.keys(this).forEach((k) => {
        const values = this[k].value;
        const defaultValues = this.defaultSettings[k];

        if (!values) return;
        const changedValues = Object.keys(values)
          .filter((item) => values[item] !== defaultValues[item])
          .reduce((acc, item) => ({
            ...acc,
            [item]: values[item],
          }), {});

        if (isEmpty(changedValues)) Storage.removeItem(`${settings}${k}`);
        Storage.setItem(`${settings}${k}`, changedValues);
      });
    } else {
      Object.keys(this).forEach((k) => {
        Storage.setItem(`${settings}${k}`, this[k].value);
      });
    }

    const userSettings = {};

    SETTINGS.forEach((e) => {
      userSettings[e] = this[e];
    });

    if (typeof mutation === 'function') {
      mutation(userSettings);
    }
  }
}

const SettingsSingleton = new Settings(window.meetingClientSettings.public.app.defaultSettings);
export default SettingsSingleton;
