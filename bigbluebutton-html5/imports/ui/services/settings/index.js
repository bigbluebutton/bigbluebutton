import { makeVar } from '@apollo/client';
import { isEmpty } from 'radash';
import LocalStorage from '/imports/ui/services/storage/local';
import SessionStorage from '/imports/ui/services/storage/session';
import { CHANGED_SETTINGS, DEFAULT_SETTINGS, SETTINGS } from './enums';

class Settings {
  constructor() {
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
  }

  setDefault(defaultValues) {
    if (this?.application?.locale) {
      this.application.locale = navigator.languages ? navigator.languages[0] : false
      || navigator.language;
    }

    Object.keys(defaultValues).forEach((key) => {
      this[`_${key}`].reactiveVar(defaultValues[key]);
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

const SettingsSingleton = new Settings();
export const getSettingsSingletonInstance = () => SettingsSingleton;

export default SettingsSingleton;
