import Storage from '/imports/ui/services/storage/session';
import _ from 'lodash';

const SETTINGS = [
  'application',
  'audio',
  'video',
  'cc',
  'participants',
];

class Settings {
  constructor(defaultValues = {}) {
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

    // Sets default locale to browser locale
    defaultValues.application.locale = navigator.languages ? navigator.languages[0] : false ||
                                       navigator.language ||
                                       defaultValues.application.locale;

    this.setDefault(defaultValues);
  }

  setDefault(defaultValues) {
    const savedSettings = {};

    SETTINGS.forEach((s) => {
      savedSettings[s] = Storage.getItem(`settings_${s}`);
    });

    Object.keys(defaultValues).forEach((key) => {
      this[key] = _.extend(defaultValues[key], savedSettings[key]);
    });

    this.save();
  }

  save() {
    Object.keys(this).forEach(k => Storage.setItem(`settings${k}`, this[k].value));
  }
}

const SettingsSingleton = new Settings(Meteor.settings.public.app.defaultSettings);
export default SettingsSingleton;
