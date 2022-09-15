import { Meteor } from 'meteor/meteor';
import { createLogger, format, transports } from 'winston';
import WinstonPromTransport from './prom-metrics/winstonPromTransport';

const LOG_CONFIG = Meteor?.settings?.private?.serverLog || {};
const { level } = LOG_CONFIG;

const serverInfoFormat = format.printf(({ level, message, ...metadata}) => {
  const instanceId = parseInt(process.env.INSTANCE_ID, 10);
  const role = process.env.BBB_HTML5_ROLE;
  const server = Meteor?.isDevelopment ? 'development' : `${role} ${instanceId}`;

  let msg = `${server} [${level}] : ${message} `  
  if(metadata) {
	msg += JSON.stringify(metadata)
  }
  return msg
});

const Logger = createLogger({
  level,
  format: format.combine(
    format.colorize({ level: true }),
    format.splat(),
    format.simple(),
    serverInfoFormat,
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
    // export error logs to prometheus
    new WinstonPromTransport({
      level: 'error',
    }),
  ],
});

export default Logger;

export const logger = Logger;
