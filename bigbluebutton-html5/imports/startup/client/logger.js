import Auth from '/imports/ui/services/auth';
import { Meteor } from 'meteor/meteor';
import { createLogger, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';
import { ServerStream } from '@browser-bunyan/server-stream';
import { nameFromLevel } from '@browser-bunyan/levels';

// The logger accepts "console","server", and "external" as targets
// Multiple targets can be set as an array in the settings under public.log
// To add more targets use the format { "target": "server", "level": "info" },
// and add it to the public.log array
// The accepted levels are "debug", "info", "warn", "error"
// To send to URL, use the format { "target": "external", "level": "info", 
// "streamOptions": {"url": "", "httpMethod": "PUT"} }
// externalURL is the end-point that logs will be sent to
// Call the logger by doing a function call with the level name, I.e, logger.warn('Hi on warn')

const LOG_CONFIG = Meteor.settings.public.log || {};
const { fullInfo } = Auth;

// create a custom stream that logs to an end-point
class ServerLoggerStream extends ServerStream {
  write(rec) {
    if (fullInfo.meetingId != null) {
      rec.clientInfo = fullInfo;
    }
    return super.write(rec);
  }
}

// Created a custom stream to log to the meteor server
class MeteorStream {
  write(rec) {
    if (fullInfo.meetingId != null) {
      Meteor.call('logClient', nameFromLevel[rec.level], rec.msg, fullInfo);
    } else {
      Meteor.call('logClient', nameFromLevel[rec.level], rec.msg);
    }
  }
}

function createStreamForTarget(target, options) {
  const TARGET_EXTERNAL = 'external';
  const TARGET_CONSOLE = 'console';
  const TARGET_SERVER = 'server';
 
  let Stream = ConsoleRawStream;
  switch (target) {
    case TARGET_EXTERNAL:
      Stream = ServerLoggerStream
      break;
    case TARGET_CONSOLE:
      Stream = ConsoleFormattedStream;
      break;
    case TARGET_SERVER:
      Stream = MeteorStream;
      break;
  }
  
  return new Stream(options);
}

function generateLoggerStreams(config) {
  return config.map(( currentValue ) => {
    return({
      level: currentValue.level,
      stream: createStreamForTarget(currentValue.target, currentValue.streamOptions)})
  });
}

// Creates the logger with the array of streams of the chosen targets
const logger = createLogger({
  name: 'clientLogger',
  streams: generateLoggerStreams(LOG_CONFIG),
  serializers: stdSerializers,
  src: true,
});


export default logger;
