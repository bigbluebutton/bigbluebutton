import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useReactiveVar } from '@apollo/client';
import { LiveKitRoom } from '@livekit/components-react';
import {
  ConnectionError,
  DisconnectReason,
  LogLevel,
  setLogLevel,
  type Room,
  type InternalRoomOptions,
  type RoomConnectOptions,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { useIceServers } from '/imports/ui/components/livekit/hooks';
import shouldForceRelay from '/imports/ui/components/livekit/utils';
import { ForcedReconnectionError } from '/imports/ui/components/livekit/errors';
import { LK_FATAL_ERROR_EVENT, type LiveKitFatalErrorDetail, type MembershipKey } from '/imports/ui/services/livekit';

interface BaseLiveKitRoomProps {
  membershipKey: MembershipKey;
  room: Room;
  url: string;
  token: string;
  bbbSessionToken: string;
  roomOptions: Partial<InternalRoomOptions>;
  logLevel?: LogLevel;
  audio?: boolean;
  video?: boolean;
  withAutoSubscribe?: boolean;
  reconnectOnFatalFailures?: boolean;
  logPrefix: string;
  maxConnAttempts?: number;
  // Invoked once when reconnect attempts are exhausted (connAttempts reaches
  // maxConnAttempts with a still-pending retryable error).
  onReconnectExhausted?: () => void;
  // Invoked when a fatal error actually triggers a forced reconnect cycle.
  onFatalReconnect?: () => void;
  // Invoked on a disconnect the SDK will not retry, so the owner can unwind
  // whatever server-side state this room materializes.
  onTerminalDisconnect?: (reason?: DisconnectReason) => void;
  children?: React.ReactNode;
}

const DEFAULT_MAX_CONN_ATTEMPTS = 10;

// Disconnects LiveKit never retries: the server sends these with LeaveRequest
// action=DISCONNECT, ending the session without a reconnect cycle. See
// https://github.com/livekit/client-sdk-js/blob/main/src/room/RTCEngine.ts
// (LeaveRequest handling).
const TERMINAL_DISCONNECT_REASONS: DisconnectReason[] = [
  DisconnectReason.DUPLICATE_IDENTITY,
  DisconnectReason.PARTICIPANT_REMOVED,
  DisconnectReason.ROOM_DELETED,
];

const BaseLiveKitRoom: React.FC<BaseLiveKitRoomProps> = ({
  membershipKey,
  room,
  url,
  token,
  bbbSessionToken,
  roomOptions,
  logLevel,
  audio = false,
  video = false,
  withAutoSubscribe = true,
  reconnectOnFatalFailures = true,
  logPrefix,
  maxConnAttempts = DEFAULT_MAX_CONN_ATTEMPTS,
  onReconnectExhausted,
  onFatalReconnect,
  onTerminalDisconnect,
  children,
}) => {
  const [connAttempts, setConnAttempts] = useState(0);
  const [connError, setConnError] = useState<Error | null>(null);
  const initialTokenRef = React.useRef<string | null>(null);
  const [optionsApplied, setOptionsApplied] = useState(false);
  const [connectOptions, setConnectOptions] = useState<RoomConnectOptions | undefined>(undefined);
  const isClientConnected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const {
    iceServers,
    isLoading: iceServersLoading,
    hasTurnServer,
  } = useIceServers(bbbSessionToken);
  const isReconnectingRef = useRef(false);
  const reconnectExhaustedRef = useRef(false);

  const onDisconnected = useCallback((reason?: DisconnectReason) => {
    logger.warn({
      logCode: `${logPrefix}_disconnected`,
      extraInfo: {
        reason,
        url,
        iceServers,
        connAttempts,
        membershipKey,
      },
    }, `${logPrefix}: room disconnected, reason=${reason}`);

    if (reason !== undefined && TERMINAL_DISCONNECT_REASONS.includes(reason)) {
      onTerminalDisconnect?.(reason);
    }
  }, [logPrefix, url, iceServers, connAttempts, membershipKey, onTerminalDisconnect]);

  const onError = useCallback((error: Error) => {
    logger.error({
      logCode: `${logPrefix}_error`,
      extraInfo: {
        membershipKey,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        url,
        connAttempts,
      },
    }, `${logPrefix}: room error: ${error.message}`);
    setConnError(error);
    setConnAttempts((p) => p + 1);
  }, [logPrefix, url, connAttempts, membershipKey]);

  const onConnected = useCallback(() => {
    logger.info({
      logCode: `${logPrefix}_connected`,
      extraInfo: { membershipKey, url },
    }, `${logPrefix}: connected`);
    setConnAttempts(0);
    setConnError(null);
  }, [logPrefix, url, membershipKey]);

  useEffect(() => {
    if (iceServersLoading) {
      setConnectOptions(undefined);
      return;
    }

    const forceRelay = shouldForceRelay(hasTurnServer);
    const opts: RoomConnectOptions = {
      autoSubscribe: withAutoSubscribe,
      rtcConfig: {
        iceServers,
        iceTransportPolicy: forceRelay ? 'relay' : undefined,
      },
    };

    // eslint-disable-next-line no-param-reassign
    room.options = { ...room.options, ...roomOptions };
    setOptionsApplied(true);
    setConnectOptions(opts);
  }, [room, roomOptions, iceServersLoading, iceServers, hasTurnServer, withAutoSubscribe]);

  useEffect(() => {
    if (!url) return;

    room.prepareConnection(url).catch((error: Error) => {
      logger.error({
        logCode: `${logPrefix}_prepare_error`,
        extraInfo: {
          membershipKey,
          url,
          errorMessage: error?.message,
          errorStack: error?.stack,
        },
      }, `${logPrefix}: prepareConnection failed: ${error?.message}`);
    });
  }, [room, url, logPrefix, membershipKey]);

  useEffect(() => {
    if (logLevel !== undefined) setLogLevel(logLevel);
  }, [logLevel]);

  useEffect(() => {
    return () => {
      room.disconnect();
    };
  }, [room]);

  useEffect(() => {
    if (!token
      || !url
      || !optionsApplied
      || !connectOptions
      || !isClientConnected
      || iceServersLoading
      || !connError
      || connAttempts >= maxConnAttempts) {
      return;
    }

    if (!(connError instanceof ConnectionError) && !(connError instanceof ForcedReconnectionError)) {
      setConnError(null);
      setConnAttempts(0);

      return;
    }

    setConnError(null);
    room.connect(url, token, connectOptions).catch((error: Error) => {
      logger.debug({
        logCode: `${logPrefix}_connect_retry_error`,
        extraInfo: {
          membershipKey,
          connAttempts,
          url,
          errorMessage: error?.message,
          errorStack: error?.stack,
        },
      }, `${logPrefix}: retry connect failed: ${(error)?.message}`);
    });
  }, [
    room,
    token,
    url,
    optionsApplied,
    connectOptions,
    connError,
    isClientConnected,
    iceServersLoading,
    connAttempts,
    maxConnAttempts,
    logPrefix,
    membershipKey,
  ]);

  // Reconnection tracking
  useEffect(() => {
    if (!onReconnectExhausted) return;

    const retryable = connError instanceof ConnectionError
      || connError instanceof ForcedReconnectionError;

    if (connError && retryable && connAttempts >= maxConnAttempts) {
      if (reconnectExhaustedRef.current) return;

      reconnectExhaustedRef.current = true;
      logger.warn({
        logCode: `${logPrefix}_reconnect_exhausted`,
        extraInfo: { membershipKey, connAttempts, maxConnAttempts },
      }, `${logPrefix}: reconnect attempts exhausted (${connAttempts}/${maxConnAttempts})`);
      onReconnectExhausted();
    } else if (!connError) {
      // Connection recovered
      reconnectExhaustedRef.current = false;
    }
  }, [connError, connAttempts, maxConnAttempts, onReconnectExhausted, logPrefix, membershipKey]);

  const handleFatalError = useCallback((event: Event) => {
    const { detail } = event as CustomEvent<LiveKitFatalErrorDetail>;

    if (!detail || detail.key !== membershipKey) return;

    logger.error({
      logCode: `${logPrefix}_fatal_error_reconnect`,
      extraInfo: {
        membershipKey,
        errorMessage: detail.error?.message,
        errorName: detail.error?.name,
        source: detail.source,
        reconnectOnFatalFailures,
      },
    }, `${logPrefix}: fatal error - ${detail.error?.message}, reconnect=${reconnectOnFatalFailures}`);

    if (!reconnectOnFatalFailures) return;

    if (isReconnectingRef.current || connAttempts >= maxConnAttempts) return;

    isReconnectingRef.current = true;

    if (onFatalReconnect) onFatalReconnect();

    room.disconnect().then(() => {
      const fatalError = new ForcedReconnectionError('Fatal error recovery');

      setConnError(fatalError);
      setConnAttempts((p) => p + 1);
    }).catch((disconnectError: Error) => {
      logger.error({
        logCode: `${logPrefix}_fatal_error_disconnect_failed`,
        extraInfo: {
          membershipKey,
          errorMessage: disconnectError?.message,
          errorName: disconnectError?.name,
          errorStack: disconnectError?.stack,
        },
      }, `${logPrefix}: failed to disconnect during fatal error recovery`);
    }).finally(() => {
      isReconnectingRef.current = false;
    });
  }, [room, logPrefix, membershipKey, reconnectOnFatalFailures, connAttempts, maxConnAttempts, onFatalReconnect]);

  useEffect(() => {
    window.addEventListener(LK_FATAL_ERROR_EVENT, handleFatalError);

    return () => window.removeEventListener(LK_FATAL_ERROR_EVENT, handleFatalError);
  }, [handleFatalError]);

  if (iceServersLoading || !optionsApplied || !connectOptions || !url || !token) return null;

  // LiveKitRoom keeps the token it connected with initially to not trigger
  // unnecessary reconnects on token refreshes. The retry effect above
  // reads the live `token` prop in case of reconns.
  if (!initialTokenRef.current) initialTokenRef.current = token;

  return (
    <LiveKitRoom
      room={room}
      token={initialTokenRef.current}
      serverUrl={url}
      connect
      audio={audio}
      video={video}
      connectOptions={connectOptions}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      onError={onError}
      style={{ zIndex: 0, height: 'initial', width: 'initial' }}
    >
      {children}
    </LiveKitRoom>
  );
};

export default BaseLiveKitRoom;
