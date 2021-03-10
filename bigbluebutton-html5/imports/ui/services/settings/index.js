import Storage from '/imports/ui/services/storage/session';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';

const SETTINGS = [
  'application',
  'audio',
  'video',
  'cc',
  'dataSaving',
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
    defaultValues.application.locale = navigator.languages ? navigator.languages[0] : false
      || navigator.language
      || defaultValues.application.locale;
    defaultValues.application.darkMode=false;
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
  handleDarkMode(darkMode){
    if(darkMode){
      document.documentElement.style.setProperty('--color-chat', getComputedStyle(document.body).getPropertyValue('--color-darkmode-chat'));
      document.documentElement.style.setProperty('--color-background', getComputedStyle(document.body).getPropertyValue('--color-darkmode-background'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-background-color', getComputedStyle(document.body).getPropertyValue('--color-darkmode-background'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-color', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--user-list-darktheme', getComputedStyle(document.body).getPropertyValue('--color-darkmode-background'));
      document.documentElement.style.setProperty('--color-input', getComputedStyle(document.body).getPropertyValue('--color-darkmode-input'));
      document.documentElement.style.setProperty('--color-theme-text', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--list-item-hover', getComputedStyle(document.body).getPropertyValue('--list-item-darkmode-hover'));
      document.documentElement.style.setProperty('--color-chat-thumbnail', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-small-title', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-chat-name-main', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-chat-box', getComputedStyle(document.body).getPropertyValue('--color-darkmode-chat'));
      document.documentElement.style.setProperty('--color-background-scrollablelist', getComputedStyle(document.body).getPropertyValue('--color-background-darkmode-scrollablelist'));
      document.documentElement.style.setProperty('--color-heading', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-userlistPad', getComputedStyle(document.body).getPropertyValue('--color-darkmode-userlistPad'));
      document.documentElement.style.setProperty('--color-theme-text', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-background-messageList', getComputedStyle(document.body).getPropertyValue('--color-background-darkmode-messageList'));
      document.documentElement.style.setProperty('--color-hide-chat', getComputedStyle(document.body).getPropertyValue('--color-darkmode-chat'));
      document.documentElement.style.setProperty('--color-btn-hide-chat', getComputedStyle(document.body).getPropertyValue('-color-white'));
      document.documentElement.style.setProperty('--color-icon', getComputedStyle(document.body).getPropertyValue('--color-darkmode-icon'));
      document.documentElement.style.setProperty('--background-icon', getComputedStyle(document.body).getPropertyValue('--background-darkmode-icon'));
      document.documentElement.style.setProperty('--color-btn-hide-text', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-background-listItem', getComputedStyle(document.body).getPropertyValue('--color-background-darkmode-listItem'));
      document.documentElement.style.setProperty('--btn-dark-color', getComputedStyle(document.body).getPropertyValue('--color-darkmode-chat'));
    }
    else{
      document.documentElement.style.setProperty('--color-chat', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-background', getComputedStyle(document.body).getPropertyValue('--color-standard-background'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-background-color', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--systemMessage-darkmode-color', getComputedStyle(document.body).getPropertyValue('--color-black'));
      document.documentElement.style.setProperty('--user-list-darktheme', getComputedStyle(document.body).getPropertyValue('--color-off-white'));
      document.documentElement.style.setProperty('--color-input', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-theme-text', getComputedStyle(document.body).getPropertyValue('--color-text'));
      document.documentElement.style.setProperty('--list-item-hover', getComputedStyle(document.body).getPropertyValue('--list-item-bg-hover'));
      document.documentElement.style.setProperty('--color-chat-thumbnail', getComputedStyle(document.body).getPropertyValue('--color-gray-light'));
      document.documentElement.style.setProperty('--color-small-title', getComputedStyle(document.body).getPropertyValue('--color-gray-light'));
      document.documentElement.style.setProperty('--color-chat-name-main', getComputedStyle(document.body).getPropertyValue('--color-gray-dark'));
      document.documentElement.style.setProperty('--color-chat-box', getComputedStyle(document.body).getPropertyValue('--list-item-bg-hover'));
      document.documentElement.style.setProperty('--color-background-scrollablelist', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-heading', getComputedStyle(document.body).getPropertyValue('--color-gray-dar'));
      document.documentElement.style.setProperty('--color-userlistPad', getComputedStyle(document.body).getPropertyValue('--color-off-white'));
      document.documentElement.style.setProperty('--color-theme-text', getComputedStyle(document.body).getPropertyValue('--color-gray'));
      document.documentElement.style.setProperty('--color-background-messageList', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-hide-chat', getComputedStyle(document.body).getPropertyValue('--color-white'));
      document.documentElement.style.setProperty('--color-btn-hide-chat', getComputedStyle(document.body).getPropertyValue('--color-dark-grey'));
      document.documentElement.style.setProperty('--color-icon', getComputedStyle(document.body).getPropertyValue('--color-gray-dark'));
      document.documentElement.style.setProperty('--background-icon', getComputedStyle(document.body).getPropertyValue('transparent'));
      document.documentElement.style.setProperty('--color-btn-hide-text', getComputedStyle(document.body).getPropertyValue('--color-black'));
      document.documentElement.style.setProperty('--color-background-listItem', getComputedStyle(document.body).getPropertyValue('--color-off-white'));
      document.documentElement.style.setProperty('--btn-dark-color', getComputedStyle(document.body).getPropertyValue('--color-white'));
    }
  }
  
  save() {


    Object.keys(this).forEach((k) => {
      Storage.setItem(`settings${k}`, this[k].value);
    });


    this.handleDarkMode(this["_application"].value.darkMode);

    const userSettings = {};

    SETTINGS.forEach((e) => {
      userSettings[e] = this[e];
    });

    Tracker.autorun((c) => {
      const { status } = Meteor.status();
      if (status === 'connected') {
        c.stop();
        makeCall('userChangedLocalSettings', userSettings);
      }
    });
  }
}

const SettingsSingleton = new Settings(Meteor.settings.public.app.defaultSettings);
export default SettingsSingleton;
