/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import YAML from 'yaml';

const YAML_FILE_PATH = process.env.BBB_HTML5_SETTINGS || 'assets/app/config/settings.yml';

try {
  if (fs.existsSync(YAML_FILE_PATH)) {
    const SETTINGS = YAML.parse(fs.readFileSync(YAML_FILE_PATH, 'utf-8'));

    Meteor.settings = SETTINGS;
    __meteor_runtime_config__.PUBLIC_SETTINGS = SETTINGS.public;
  } else {
    throw new Error('File doesn\'t exists');
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Error on load configuration file.', error);
}
