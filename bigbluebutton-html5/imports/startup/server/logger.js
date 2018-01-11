import { Meteor } from 'meteor/meteor';
import Winston from 'winston';

const Logger = new Winston.Logger();

Logger.configure({
  levels: {
    error: 0, warn: 1, info: 2, verbose: 3, debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'cyan',
    debug: 'magenta',
  },
});

// Write logs to console
Logger.add(Winston.transports.Console, {
  prettyPrint: false,
  humanReadableUnhandledException: true,
  colorize: true,
  handleExceptions: true,
});

Meteor.startup(() => {
  const LOG_CONFIG = Meteor.settings.private.log || {};
  let { filename } = LOG_CONFIG;

  // Set Logger message level priority for the console
  Logger.transports.console.level = LOG_CONFIG.level;

  // Determine file to write logs to
  if (filename) {
    if (Meteor.isDevelopment) {
      const path = Npm.require('path');
      filename = path.join(process.env.PWD, filename);
    }

    Logger.add(Winston.transports.File, {
      filename,
      prettyPrint: true,
    });
  }
});

export default Logger;

export const logger = Logger;
