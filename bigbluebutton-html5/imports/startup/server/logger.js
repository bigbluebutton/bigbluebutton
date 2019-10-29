import { Meteor } from 'meteor/meteor';
import { createLogger, format, transports } from 'winston';

const LOG_CONFIG = Meteor.settings.private.serverLog || {};
const { level } = LOG_CONFIG;

const Logger = createLogger({
  level,
  format: format.combine(
    format.colorize({ level: true }),
    format.splat(),
    format.simple(),
  ),
  transports: [
    // console logging
    new transports.Console({
      prettyPrint: false,
      humanReadableUnhandledException: true,
      colorize: true,
      handleExceptions: true,
      level,
    }),
  ],
});

export default Logger;

export const logger = Logger;
