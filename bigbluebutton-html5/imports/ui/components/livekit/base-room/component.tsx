import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useReactiveVar } from '@apollo/client';
import { LiveKitRoom } from '@livekit/components-react';
import {
  ConnectionError,
  ConnectionState,
  DisconnectReason,
  LogLevel,
  RoomEvent,
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
import {
  LK_FATAL_ERROR_EVENT,
  applyRoomOptions,
  isOrphaningDisconnect,
  isReconnectingState,
  type LiveKitFatalErrorDetail,
  type MembershipKey,
} from '/imports/ui/services/livekit';

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
// livekit-client only backs its connection attempts off against its own cloud
// hosts, so a self-hosted deployment gets none and the whole attempt budget
// would be spent in the time it takes to refuse a socket ten times.
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 8000;
// Past livekit-client's own reconnect ladder, which runs to roughly 52s once
// its jitter is counted, so only a session it has already given up on gets
// here.
const RECONNECT_STALL_TIMEOUT_MS = 60000;

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
  // A refused room answers every attempt with its own disconnect, and each one
  // would otherwise count as an attempt of ours: the budget then goes in the
  // time it takes to refuse it ten times, however the retries are paced. One
  // cycle, one attempt.
  const retryPendingRef = useRef(false);

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

    if (!isOrphaningDisconnect(reason)) return;

    if (onTerminalDisconnect) {
      onTerminalDisconnect(reason);

      return;
    }

    if (retryPendingRef.current) return;

    // The SDK emits no error for a disconnect it will not retry, so the retry
    // effect has nothing to act on; a room whose owner keeps it (the primary)
    // is reconnected through that effect, so trigger it here
    retryPendingRef.current = true;
    setConnError(new ForcedReconnectionError(`Terminal disconnect (reason=${reason})`));
    setConnAttempts((p) => p + 1);
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

    if (retryPendingRef.current) return;

    retryPendingRef.current = true;
    setConnError(error);
    setConnAttempts((p) => p + 1);
  }, [logPrefix, url, connAttempts, membershipKey]);

  const onConnected = useCallback(() => {
    logger.info({
      logCode: `${logPrefix}_connected`,
      extraInfo: { membershipKey, url },
    }, `${logPrefix}: connected`);
    retryPendingRef.current = false;
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

    applyRoomOptions(room, roomOptions);
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
      return undefined;
    }

    if (!(connError instanceof ConnectionError) && !(connError instanceof ForcedReconnectionError)) {
      setConnError(null);
      setConnAttempts(0);

      return undefined;
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * (2 ** Math.max(0, connAttempts - 1)),
      RECONNECT_MAX_DELAY_MS,
    );
    const timer = setTimeout(() => {
      setConnError(null);
      retryPendingRef.current = false;
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
    }, delay);

    return () => clearTimeout(timer);
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

  // A session the SDK stops trying to restore does not always end in a
  // Disconnected event: a signal socket that stays open and carries nothing
  // leaves the room in (signal)Reconnecting indefinitely, so onDisconnected
  // never runs, connError is never set and the retry effect below has nothing
  // to act on. Manufacture the terminal signal from the connection state.
  useEffect(() => {
    let stallTimer: ReturnType<typeof setTimeout> | undefined;

    const forceReconnect = () => {
      if (isReconnectingRef.current) return;

      isReconnectingRef.current = true;
      retryPendingRef.current = true;
      logger.warn({
        logCode: `${logPrefix}_reconnect_stalled`,
        extraInfo: {
          membershipKey, url, connAttempts, state: room.state,
        },
      }, `${logPrefix}: room held out of connected, forcing a reconnect`);

      // The captures outlive this teardown: it is ours, not the user leaving.
      room.disconnect(false).catch(() => {}).then(() => {
        setConnError(new ForcedReconnectionError(`Reconnect stalled (state=${room.state})`));
        setConnAttempts((p) => p + 1);
        isReconnectingRef.current = false;
      });
    };

    const armStallTimer = (state: ConnectionState) => {
      if (stallTimer) clearTimeout(stallTimer);

      stallTimer = isReconnectingState(state)
        ? setTimeout(forceReconnect, RECONNECT_STALL_TIMEOUT_MS)
        : undefined;
    };

    room.on(RoomEvent.ConnectionStateChanged, armStallTimer);
    armStallTimer(room.state);

    return () => {
      if (stallTimer) clearTimeout(stallTimer);
      room.off(RoomEvent.ConnectionStateChanged, armStallTimer);
    };
  }, [room, logPrefix, membershipKey, url, connAttempts]);

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
