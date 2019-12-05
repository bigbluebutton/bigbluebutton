import { Meteor } from 'meteor/meteor';
import { createLogger, format, transports } from 'winston';

const LOG_CONFIG = Meteor.settings.private.serverLog || {};
const { level } = LOG_CONFIG;

export const logTransports = {
  console: new transports.Console({
    prettyPrint: false,
    humanReadableUnhandledException: true,
    colorize: true,
    handleExceptions: true,
    level,
  }),
};

const Logger = createLogger({
  format: format.combine(
    format.colorize({ level: true }),
    format.splat(),
    format.simple(),
  ),
  transports: [
    // console logging
    logTransports.console,
  ],
});
// setTimeout(()=> logTransports.console.level = 'debug', 5000);
export default Logger;

export const logger = Logger;
