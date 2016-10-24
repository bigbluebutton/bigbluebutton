import { Meteor } from 'meteor/meteor';
import Winston from 'winston';

let Logger = new Winston.Logger();

// Write logs to console
Logger.add(Winston.transports.Console, {
  prettyPrint: false,
  humanReadableUnhandledException: true,
  colorize: true,
  handleExceptions: true,
});

Meteor.startup(() => {
  const LOG_CONFIG = Meteor.settings.log || {};
  let filename = LOG_CONFIG.filename;

  // Determine file to write logs to
  if (filename) {
    if (Meteor.settings.runtime.env === 'development') {
      const path = Npm.require('path');
      filename = path.join(process.env.PWD, filename);
    }

    Logger.add(Winston.transports.File, {
      filename: filename,
      prettyPrint: true,
    });
  }
});

export default Logger;

export let logger = Logger;
