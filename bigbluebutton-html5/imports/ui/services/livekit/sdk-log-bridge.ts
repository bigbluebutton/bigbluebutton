import {
  LogLevel,
  LoggerNames,
  setLogExtension,
  setLogLevel,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';

// Constrain SDP content in logs (they can get chunky)
const SDP_FIELDS = new Set(['sdp', 'mungedSdp', 'originalSdp', 'remoteSdp']);
const MAX_STRING_LENGTH = 512;
const MAX_DEPTH = 3;

const summarizeSdp = (sdp: string) => ({
  length: sdp.length,
  mLines: (sdp.match(/^m=/gm) ?? []).length,
});

const SDK_ERROR_DETAIL_FIELDS = new Set(['reason', 'reasonName', 'code', 'status']);

const trimError = (error: Error): Record<string, unknown> => ({
  name: error.name,
  message: error.message,
  ...Object.fromEntries(Object.entries(error).filter(([key]) => SDK_ERROR_DETAIL_FIELDS.has(key))),
});

const trimValue = (value: unknown, key: string, depth: number): unknown => {
  if (value instanceof Error) return trimError(value);

  if (typeof value === 'string') {
    if (SDP_FIELDS.has(key)) return summarizeSdp(value);

    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...` : value;
  }

  if (value && typeof value === 'object') {
    const { sdp } = value as { sdp?: unknown };

    if (typeof sdp === 'string') return { ...summarizeSdp(sdp), type: (value as { type?: unknown }).type };

    if (depth >= MAX_DEPTH) return '[object]';

    if (Array.isArray(value)) return value.slice(0, 20).map((item) => trimValue(item, key, depth + 1));

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, trimValue(v, k, depth + 1)]),
    );
  }

  return value;
};

let installed = false;

export const installLiveKitSdkLogBridge = (): void => {
  if (installed) return;
  installed = true;

  setLogExtension((level, msg, context) => {
    try {
      const entry = {
        logCode: 'livekit_sdk_log',
        extraInfo: {
          level: LogLevel[level],
          context: trimValue(context, '', 0),
        },
      };

      const message = `LiveKit SDK: ${msg}`;

      if (level >= LogLevel.error) {
        logger.error(entry, message);
      } else if (level === LogLevel.warn) {
        logger.warn(entry, message);
      } else if (level === LogLevel.info) {
        logger.info(entry, message);
      } else {
        logger.debug(entry, message);
      }
    } catch {
      // The SDK already wrote the line to the console - "handled"
    }
  });
};

const toLogLevel = (level: LogLevel | string): LogLevel | undefined => {
  if (typeof level === 'number') return level;

  const wanted = level.toLowerCase();

  const match = Object.entries(LogLevel).find(
    ([name, value]) => typeof value === 'number' && name.toLowerCase() === wanted,
  );

  return match ? (match[1] as LogLevel) : undefined;
};

export const applyLiveKitSdkLogLevel = (level: LogLevel | string): void => {
  const resolved = toLogLevel(level);

  if (resolved === undefined) return;

  setLogLevel(resolved);
  setLogLevel(Math.min(resolved, LogLevel.info), LoggerNames.Engine);
};
