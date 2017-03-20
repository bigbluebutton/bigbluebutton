import Storage from '/imports/ui/services/storage/session';
import _ from 'underscore';

const SettingsCollection = new Mongo.Collection(null);

class Settings {
  constructor() {
    console.log('constructor 4Head');
    const defaultSettings = Meteor.settings.public.app.defaultSettings;

    const savedSettings = {
      application: this.getSettingsFor('application'),
      audio: this.getSettingsFor('audio'),
      video: this.getSettingsFor('video'),
      cc: this.getSettingsFor('cc'),
      participants: this.getSettingsFor('participants'),
    };

    Object.keys(defaultSettings).forEach(key => {
      this[key] = _.extend(defaultSettings[key], savedSettings[key]);
    });
  }

  // get achalaboy(key) {
  //   return SettingsCollection.findOne({ key }).properties;
  // }

  // set setalaboy(key, object) {
  //   SettingsCollection.upsert({ key }, object);
  // }

  getSettingsFor(key) {
   const setting = Storage.getItem(`settings_${key}`);
   return setting;
 };
}

const SettingsSingleton = new Settings();
export default SettingsSingleton;
