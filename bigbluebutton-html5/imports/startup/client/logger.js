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
// To send to URL, use the format    {"target": "external","level": "info",
// "url": "","method": ""}
// externalURL is the end-point that logs will be sent to
// Call the logger by doing a function call with the level name, I.e, logger.warn('Hi on warn')
const fallback = { console: { enabled: true, level: 'info' } };
const LOG_CONFIG = (JSON.parse(sessionStorage.getItem('clientStartupSettings') || '{}')?.clientLog) || fallback;

export function createStreamForTarget(target, options) {
  const TARGET_EXTERNAL = 'external';
  const TARGET_CONSOLE = 'console';
  const TARGET_SERVER = 'server';

  let Stream = ConsoleRawStream;
  switch (target) {
    case TARGET_EXTERNAL:
      Stream = ServerLoggerStream;
      break;
    case TARGET_CONSOLE:
      Stream = ConsoleFormattedStream;
      break;
    case TARGET_SERVER:
      Stream = MeteorStream;
      break;
    default:
      Stream = ConsoleFormattedStream;
  }

  return new Stream(options);
}

export function generateLoggerStreams(config) {
  let result = [];
  Object.keys(config).forEach((key) => {
    const logOption = config[key];
    if (logOption && logOption.enabled) {
      const { level, ...streamOptions } = logOption;
      result = result.concat({ level, stream: createStreamForTarget(key, streamOptions) });
    }
  });
  return result;
}

// Custom stream that logs to an end-point
class ServerLoggerStream extends ServerStream {
  constructor(params) {
    super(params);

    if (params.logTag) {
      this.logTagString = params.logTag;
    }
    this.auth = null;
  }

  setConfig(config) {
    const streams = generateLoggerStreams(config);
    const { addStream } = this;
    streams.forEach((stream) => {
      addStream(stream);
    });
  }

  setAuth(auth) {
    this.auth = auth;
  }

  getUserData() {
    let userInfo = {};
    if (this.auth) {
      userInfo = this.auth.fullInfo;
    } else {
      userInfo = {
        meetingId: sessionStorage.getItem('meetingId'),
        userId: sessionStorage.getItem('userId'),
        logoutUrl: sessionStorage.getItem('logoutUrl'),
        sessionToken: sessionStorage.getItem('sessionToken'),
        userName: sessionStorage.getItem('userName'),
        extId: sessionStorage.getItem('extId'),
        meetingName: sessionStorage.getItem('meetingName'),
      };
    }

    if (userInfo.meetingId) {
      userInfo = {
        sessionToken: sessionStorage.getItem('sessionToken'),
      };
    }

    return {
      fullInfo: userInfo,
    };
  }

  write(rec) {
    const { fullInfo } = this.getUserData();

    this.rec = rec;
    if (fullInfo.meetingId != null) {
      this.rec.userInfo = fullInfo;
    }
    this.rec.clientBuild = window.meetingClientSettings?.public?.app?.html5ClientBuild;
    this.rec.connectionId = Meteor?.connection?._lastSessionId;
    if (this.logTagString) {
      this.rec.logTag = this.logTagString;
    }
    return super.write(this.rec);
  }
}

// Custom stream to log to the meteor server
class MeteorStream {
  write(rec) {
    const { fullInfo } = this.getUserData();
    const clientURL = window.location.href;

    this.rec = rec;
    if (fullInfo.meetingId != null) {
      if (!this.rec.extraInfo) {
        this.rec.extraInfo = {};
      }

      this.rec.extraInfo.clientURL = clientURL;

      Meteor.call(
        'logClient',
        nameFromLevel[this.rec.level],
        this.rec.msg,
        this.rec.logCode,
        this.rec.extraInfo,
        fullInfo,
      );
    } else {
      Meteor.call(
        'logClient',
        nameFromLevel[this.rec.level],
        this.rec.msg,
        this.rec.logCode,
        { ...rec.extraInfo, clientURL },
      );
    }
  }
}

// Creates the logger with the array of streams of the chosen targets
const logger = createLogger({
  name: 'clientLogger',
  streams: generateLoggerStreams(LOG_CONFIG),
  serializers: stdSerializers,
  src: true,
});

export default logger;
