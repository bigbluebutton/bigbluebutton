import { makeVar } from '@apollo/client';
import { isEmpty } from 'radash';
import LocalStorage from '/imports/ui/services/storage/local';
import SessionStorage from '/imports/ui/services/storage/session';
import { CHANGED_SETTINGS, DEFAULT_SETTINGS, SETTINGS } from './enums';
import getFromUserSettings from '/imports/ui/services/users-settings';

class Settings {
  constructor(defaultValues = {}) {
    const writableDefaultValues = JSON.parse(JSON.stringify(defaultValues));
    Object.values(SETTINGS).forEach((p) => {
      const privateProp = `_${p}`;
      this[privateProp] = {
        reactiveVar: makeVar(undefined),
      };

      const varProp = `${p}Var`;
      Object.defineProperty(this, varProp, {
        get: () => this[privateProp].reactiveVar,
      });

      Object.defineProperty(this, p, {
        get: () => this[privateProp].reactiveVar(),

        set: (v) => {
          this[privateProp].reactiveVar(v);
        },
      });
    });
    this.defaultSettings = {};
    // Sets default locale to browser locale
    writableDefaultValues.application.locale = navigator.languages ? navigator.languages[0] : false
      || navigator.language
      || writableDefaultValues.application.locale;

    const showAnimationsDefault = getFromUserSettings(
      'bbb_show_animations_default',
      window.meetingClientSettings.public.app.defaultSettings.application.animations,
    );

    const showDarkThemeDefault = getFromUserSettings(
      'bbb_prefer_dark_theme',
      window.meetingClientSettings.public.app.defaultSettings.application.darkTheme,
    );

    writableDefaultValues.application.animations = showAnimationsDefault;
    writableDefaultValues.application.darkTheme = showDarkThemeDefault;

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
    const APP_CONFIG = window.meetingClientSettings.public.app;

    const Storage = (APP_CONFIG.userSettingsStorage === 'local') ? LocalStorage : SessionStorage;
    const savedSettings = {};

    Object.values(SETTINGS).forEach((s) => {
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
    const APP_CONFIG = window.meetingClientSettings.public.app;

    const Storage = (APP_CONFIG.userSettingsStorage === 'local') ? LocalStorage : SessionStorage;
    if (settings === CHANGED_SETTINGS) {
      Object.keys(this).forEach((k) => {
        const values = this[k].reactiveVar && this[k].reactiveVar();
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

    Object.values(SETTINGS).forEach((e) => {
      userSettings[e] = this[e];
    });

    if (typeof mutation === 'function') {
      mutation(userSettings);
    }
  }
}

let SettingsSingleton = null;
export const getSettingsSingletonInstance = () => {
  if (!SettingsSingleton) {
    SettingsSingleton = new Settings(window.meetingClientSettings.public.app.defaultSettings);
  }
  return SettingsSingleton;
};

export default getSettingsSingletonInstance;
