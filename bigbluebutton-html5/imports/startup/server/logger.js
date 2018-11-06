import { Meteor } from 'meteor/meteor';
import { createLogger, format, transports } from 'winston';

const Logger = createLogger({
  levels: {
    error: 0, warn: 1, info: 2, verbose: 3, debug: 4,
  },
  format: format.combine(
    format.splat(),
    format.simple(),
  ),
});

Meteor.startup(() => {
  const LOG_CONFIG = Meteor.settings.private.serverLog || {};
  const { level } = LOG_CONFIG;

  // console logging
  Logger.add(new transports.Console(), {
    prettyPrint: false,
    humanReadableUnhandledException: true,
    colorize: true,
    handleExceptions: true,
    level,
  });
});

export default Logger;

export const logger = Logger;
