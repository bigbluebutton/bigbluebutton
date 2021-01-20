/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import YAML from 'yaml';

const YAML_FILE_PATH = process.env.BBB_HTML5_SETTINGS || 'assets/app/config/settings.yml';
const INSTANCE_MAX = parseInt(process.env.INSTANCE_MAX, 10) || 1;
const REQUESTED_INSTANCE_ID = parseInt(process.env.INSTANCE_ID, 10) || 1;
const INSTANCE_ID = (INSTANCE_MAX < REQUESTED_INSTANCE_ID) ? 1 : REQUESTED_INSTANCE_ID;


try {
  if (fs.existsSync(YAML_FILE_PATH)) {
    const SETTINGS = YAML.parse(fs.readFileSync(YAML_FILE_PATH, 'utf-8'));

    Meteor.settings = SETTINGS;
    Meteor.settings.public.app.instanceId = `/${INSTANCE_ID}`;

    __meteor_runtime_config__.PUBLIC_SETTINGS = SETTINGS.public;
  } else {
    throw new Error('File doesn\'t exists');
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Error on load configuration file.', error);
}
