/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line max-classes-per-file
import { createLogger, Logger, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';
import { ClientLog } from '/imports/ui/Types/meetingClientSettings';
import ServerLoggerStream from './ServerStream';
import ConsoleStream from './consoleStream';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';

// The logger accepts "console","server", and "external" as targets
// Multiple targets can be set as an array in the settings under public.log
// To add more targets use the format { "target": "server", "level": "info" },
// and add it to the public.log array
// The accepted levels are "debug", "info", "warn", "error"
// To send to URL, use the format    {"target": "external","level": "info",
// "url": "","method": ""}
// externalURL is the end-point that logs will be sent to
// Call the logger by doing a function call with the level name, I.e, logger.warn('Hi on warn')
const FALLBACK_CONFIG = meetingClientSettingsInitialValues.public.clientLog;

export function createStreamForTarget(
  target: keyof ClientLog,
  options: {
    enabled: boolean;
    url?: string;
    method?: string;
    throttleInterval?: number;
    flushOnClose?: boolean;
    logTag?: string;
    logByLevel?: boolean;
  },
) {
  const TARGET_EXTERNAL = 'external';
  const TARGET_CONSOLE = 'console';
  let Stream;
  switch (target) {
    case TARGET_EXTERNAL:
      Stream = ServerLoggerStream;
      break;
    case TARGET_CONSOLE:
    default:
      Stream = process.env.DETAILED_LOGS ? ConsoleStream : ConsoleFormattedStream;
  }

  return new Stream(options);
}

export function generateLoggerStreams(config: ClientLog) {
  let result: {
    level: string;
    stream: ConsoleRawStream | ServerLoggerStream,
  }[] = [];
  Object.keys(config).forEach((key) => {
    const logOption = config[key as keyof ClientLog];
    if (logOption && logOption.enabled) {
      const { level, ...streamOptions } = logOption;
      result = result
        .concat(
          { level, stream: createStreamForTarget(key as keyof ClientLog, { ...streamOptions, logByLevel: true }) },
        );
    }
  });
  return result;
}

class BBBClientLogger {
  private static fallback: Logger | null = null;

  private static default: Logger | null = null;

  public static get logger() {
    if (BBBClientLogger.default) return BBBClientLogger.default;

    const LOG_CONFIG = window.meetingClientSettings?.public?.clientLog;
    if (LOG_CONFIG && !BBBClientLogger.default) {
      BBBClientLogger.default = createLogger({
        name: 'clientLogger',
        streams: generateLoggerStreams(LOG_CONFIG),
        serializers: stdSerializers,
        src: true,
      });
    }

    if (!BBBClientLogger.fallback) {
      BBBClientLogger.fallback = createLogger({
        name: 'clientLogger',
        streams: generateLoggerStreams(FALLBACK_CONFIG),
        serializers: stdSerializers,
        src: true,
      });
    }

    return BBBClientLogger.default || BBBClientLogger.fallback;
  }
}

class LoggerFactory {
  public static getLogger() {
    return BBBClientLogger.logger;
  }

  public static error(...args: any[]) {
    LoggerFactory.getLogger().error(...args as [any, ...any[]]);
  }

  public static warn(...args: any[]) {
    LoggerFactory.getLogger().warn(...args as [any, ...any[]]);
  }

  public static info(...args: any[]) {
    LoggerFactory.getLogger().info(...args as [any, ...any[]]);
  }

  public static debug(...args: any[]) {
    LoggerFactory.getLogger().debug(...args as [any, ...any[]]);
  }

  public static trace(...args: any[]) {
    LoggerFactory.getLogger().trace(...args as [any, ...any[]]);
  }

  public static addStream(stream: any) {
    LoggerFactory.getLogger().addStream(stream);
  }

  public static getStreams() {
    return (LoggerFactory.getLogger() as any).streams;
  }
}
// Just add a alias to make easy for auto import on IDEs
const logger = LoggerFactory;

export default logger;
