let _ = require('lodash');
let fs = require('fs');
const settings = require('./settings');
const LOCAL_SETTINGS_FILE_PATH = '/etc/bigbluebutton/bbb-export-annotations.json';

const config = settings;

if (fs.existsSync(LOCAL_SETTINGS_FILE_PATH)) {
  const local_config = JSON.parse(fs.readFileSync(LOCAL_SETTINGS_FILE_PATH));
  _.mergeWith(config, local_config, (a, b) => (_.isArray(b) ? b : undefined));
}

module.exports = config;
