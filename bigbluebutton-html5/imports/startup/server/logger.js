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
  const { level } = LOG_CONFIG;

  // console logging
  Logger.add(Winston.transports.Console, {
    prettyPrint: false,
    humanReadableUnhandledException: true,
    colorize: true,
    handleExceptions: true,
    level,
  });

});

export default Logger;

export const logger = Logger;
