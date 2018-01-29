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

Meteor.startup(() => {
  const LOG_CONFIG = Meteor.settings.private.log || {};
  let { filename } = LOG_CONFIG;
  const { level } = LOG_CONFIG;

  // console logging
  if (Meteor.isDevelopment) {
    Logger.add(Winston.transports.Console, {
      prettyPrint: false,
      humanReadableUnhandledException: true,
      colorize: true,
      handleExceptions: true,
      level,
    });
  }

  // file logging
  if (filename) {
    // no file rotation
    if (Meteor.isDevelopment) {
      const path = Npm.require('path');
      filename = path.join(process.env.PWD, filename);

      Logger.add(Winston.transports.File, {
        filename,
        prettyPrint: true,
        level,
        prepend: true,
      });
    }

    // daily file rotation
    if (Meteor.isProduction) {
      Winston.transports.DailyRotateFile = Npm.require('winston-daily-rotate-file');
      Logger.add(Winston.transports.DailyRotateFile, {
        filename,
        datePattern: '.yyyy-dd-MM',
        prepend: false,
        level,
      });
    }
  }
});

export default Logger;

export const logger = Logger;
