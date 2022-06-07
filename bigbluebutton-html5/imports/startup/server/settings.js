/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import YAML from 'yaml';
import _ from 'lodash';

const DEFAULT_SETTINGS_FILE_PATH = process.env.BBB_HTML5_SETTINGS || 'assets/app/config/settings.yml';
const LOCAL_SETTINGS_FILE_PATH = process.env.BBB_HTML5_LOCAL_SETTINGS || '/etc/bigbluebutton/bbb-html5.yml';

try {
  if (fs.existsSync(DEFAULT_SETTINGS_FILE_PATH)) {
    const SETTINGS = YAML.parse(fs.readFileSync(DEFAULT_SETTINGS_FILE_PATH, 'utf-8'));

    if (fs.existsSync(LOCAL_SETTINGS_FILE_PATH)) {
      console.log('Local configuration found! Merging with default configuration...');
      const LOCAL_CONFIG = YAML.parse(fs.readFileSync(LOCAL_SETTINGS_FILE_PATH, 'utf-8'));
      _.mergeWith(SETTINGS, LOCAL_CONFIG, (a, b) => (_.isArray(b) ? b : undefined));
    } else console.log('Local Configuration not found! Loading default configuration...');

    Meteor.settings = SETTINGS;
    Meteor.settings.public.app.instanceId = ''; // no longer use instanceId in URLs. Likely permanent change
    // Meteor.settings.public.app.instanceId = `/${INSTANCE_ID}`;

    Meteor.settings.public.packages = {
      'dynamic-import': { useLocationOrigin: true },
    };

    __meteor_runtime_config__.PUBLIC_SETTINGS = SETTINGS.public;
  } else {
    throw new Error('File doesn\'t exists');
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Error on load configuration file.', error);
}
