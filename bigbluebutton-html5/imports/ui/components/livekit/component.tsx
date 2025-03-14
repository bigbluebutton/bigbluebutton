import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useIsSpeaking,
  useConnectionState,
  useConnectionQualityIndicator,
} from '@livekit/components-react';
import {
  ConnectionError,
  ConnectionQuality,
  DisconnectReason,
  LogLevel,
  setLogLevel,
  RoomEvent,
  type Room,
  type InternalRoomOptions,
  type RoomConnectOptions,
} from 'livekit-client';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  liveKitRoom,
} from '/imports/ui/services/livekit';
import {
  USER_SET_DEAFENED,
  USER_SET_TALKING,
} from '/imports/ui/components/livekit/mutations';
import { useIceServers } from '/imports/ui/components/livekit/hooks';
import LKAutoplayModalContainer from '/imports/ui/components/livekit/autoplay-modal/container';
import connectionStatus, { MetricStatus } from '/imports/ui/core/graphql/singletons/connectionStatus';
import SelectiveSubscription from '/imports/ui/components/livekit/selective-subscription/component';

interface BBBLiveKitRoomProps {
  url?: string;
  token?: string;
  roomOptions: Partial<InternalRoomOptions>;
  logLevel?: LogLevel;
  bbbSessionToken: string;
  usingAudio: boolean;
  usingScreenShare: boolean;
  withSelectiveSubscription: boolean;
}

interface ObserverProps {
  room: Room;
  url?: string;
  usingAudio: boolean;
}

const MAX_CONN_ATTEMPTS = 10;

const LiveKitObserver = ({
  room,
  url,
  usingAudio,
}: ObserverProps) => {
  const { localParticipant } = useLocalParticipant();
  const [setUserTalking] = useMutation(USER_SET_TALKING);
  const [setUserDeafened] = useMutation(USER_SET_DEAFENED);
  const isSpeaking = useIsSpeaking(localParticipant);
  const connectionState = useConnectionState(room);
  const { quality } = useConnectionQualityIndicator({ participant: localParticipant });
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore
  const isDeafened = useReactiveVar(AudioManager._isDeafened.value) as boolean;

  useEffect(() => {
    logger.info({
      logCode: 'livekit_conn_state_changed',
      extraInfo: {
        connectionState,
        url,
      },
    }, `LiveKit conn state changed: ${connectionState}`);
  }, [connectionState]);

  useEffect(() => {
    if (!usingAudio) return;

    setUserTalking({
      variables: {
        talking: isSpeaking,
      },
    });
  }, [isSpeaking, isMuted]);

  useEffect(() => {
    if (!usingAudio) return;

    setUserDeafened({
      variables: {
        deafened: isDeafened,
      },
    });
  }, [isDeafened]);

  useEffect(() => {
    let mappedQuality = MetricStatus.Normal;

    logger.debug({
      logCode: 'livekit_conn_quality_changed',
      extraInfo: {
        quality,
      },
    }, `LiveKit conn quality changed: ${quality}`);

    switch (quality) {
      case ConnectionQuality.Good:
        mappedQuality = MetricStatus.Warning;
        break;
      case ConnectionQuality.Poor:
        mappedQuality = MetricStatus.Danger;
        break;
      case ConnectionQuality.Lost:
        mappedQuality = MetricStatus.Critical;
        break;
      case ConnectionQuality.Unknown:
      case ConnectionQuality.Excellent:
      default:
        mappedQuality = MetricStatus.Normal;
        break;
    }

    connectionStatus.setLiveKitConnectionStatus(mappedQuality);
  }, [quality]);

  useEffect(() => {
    const handleSignalConnected = () => {
      logger.info({
        logCode: 'livekit_signal_connected',
      }, 'LiveKit signal connected');
    };

    liveKitRoom.on(RoomEvent.SignalConnected, handleSignalConnected);

    return () => {
      liveKitRoom.off(RoomEvent.SignalConnected, handleSignalConnected);
    };
  }, []);

  return null;
};

const BBBLiveKitRoom: React.FC<BBBLiveKitRoomProps> = ({
  url,
  token,
  roomOptions,
  logLevel,
  bbbSessionToken,
  usingAudio,
  usingScreenShare,
  withSelectiveSubscription,
}) => {
  const [connAttempts, setConnAttempts] = useState(0);
  const [connError, setConnError] = useState<Error | null>(null);
  const [lkRoomOptionsAvailable, setLkRoomOptionsAvailable] = useState(false);
  const [connectOptions, setConnectOptions] = useState<RoomConnectOptions | undefined>(undefined);
  const isClientConnected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const { iceServers, isLoading: iceServersLoading } = useIceServers(bbbSessionToken);

  const onDisconnected = useCallback((reason?: DisconnectReason) => {
    logger.warn({
      logCode: 'livekit_room_disconnected',
      extraInfo: {
        reason,
        url,
        iceServers,
        connAttempts,
      },
    }, `LiveKit room disconnected, reason=${reason}`);
  }, [url, iceServers, connAttempts]);

  const onError = useCallback((error: Error) => {
    logger.error({
      logCode: 'livekit_room_error',
      extraInfo: {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        url,
        iceServers,
        connAttempts,
        isClientConnected,
      },
    }, `LiveKit room error: ${error.message}`);
    setConnError(error);
    setConnAttempts(connAttempts + 1);
  }, [isClientConnected, url, iceServers, connAttempts]);

  const onConnected = useCallback(() => {
    logger.info({
      logCode: 'livekit_room_connected',
      extraInfo: {
        url,
      },
    }, 'LiveKit connected');
    setConnAttempts(0);
    setConnError(null);
  }, [url]);

  useEffect(() => {
    if (!token
      || !url
      || !lkRoomOptionsAvailable
      || !connectOptions
      || !isClientConnected
      || iceServersLoading
      || !connError
      || connAttempts >= MAX_CONN_ATTEMPTS
    ) {
      return;
    }

    if (!(connError instanceof ConnectionError)) {
      logger.warn({
        logCode: 'livekit_room_skip_retry',
        extraInfo: {
          connAttempts,
          url,
          iceServersLoading,
          errorMessage: connError?.message,
          errorStack: connError?.stack,
          errorName: connError?.name,
        },
      }, `LiveKit skipping reconnect attempt ${connAttempts}`);
      setConnError(null);
      setConnAttempts(0);

      return;
    }

    logger.warn({
      logCode: 'livekit_room_conn_retry',
      extraInfo: {
        connAttempts,
        url,
        iceServersLoading,
        errorMessage: connError?.message,
        errorStack: connError?.stack,
        errorName: connError?.name,
      },
    }, `LiveKit reconnect attempt ${connAttempts}`);
    setConnError(null);
    liveKitRoom.connect(url, token, connectOptions).catch((error) => {
      logger.debug({
        logCode: 'livekit_room_connect_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
          connAttempts,
          url,
        },
      }, `Failed to connect to LiveKit room: ${error?.message}`);
    });
  }, [
    token,
    url,
    lkRoomOptionsAvailable,
    connectOptions,
    connError,
    isClientConnected,
    iceServersLoading,
    connAttempts,
  ]);

  useEffect(() => {
    if (iceServersLoading) {
      setConnectOptions(undefined);
      return;
    }

    const connOpts: RoomConnectOptions = {
      autoSubscribe: !withSelectiveSubscription,
      rtcConfig: {
        iceServers,
      },
    };

    liveKitRoom.options = { ...liveKitRoom.options, ...roomOptions };
    setLkRoomOptionsAvailable(true);
    setConnectOptions(connOpts);

    logger.info({
      logCode: 'livekit_will_connect',
      extraInfo: {
        url,
        iceServers,
      },
    }, 'LiveKit room will connect');
  }, [token, url, iceServersLoading, iceServers, withSelectiveSubscription]);

  useEffect(() => {
    if (!url) return;

    liveKitRoom.prepareConnection(url).catch((error) => {
      logger.error({
        logCode: 'livekit_prepare_connection_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
          url,
        },
      }, `Failed to prepare LiveKit connection: ${error?.message}`);
    });
  }, [url]);

  useEffect(() => {
    if (logLevel !== undefined) setLogLevel(logLevel);

    return () => {
      liveKitRoom.disconnect();
    };
  }, []);

  // Screen share requires audio playback as well (Chrome supports it)
  const withAudioPlayback = usingAudio || usingScreenShare;

  if (iceServersLoading
    || !lkRoomOptionsAvailable
    || !connectOptions
    || !url) {
    return null;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      connect
      connectOptions={connectOptions}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      onError={onError}
      token={token}
      serverUrl={url}
      room={liveKitRoom}
      style={{ zIndex: 0, height: 'initial', width: 'initial' }}
    >
      <LiveKitObserver room={liveKitRoom} url={url} usingAudio={usingAudio} />
      {withAudioPlayback && <LKAutoplayModalContainer />}
      {withAudioPlayback && <RoomAudioRenderer />}
      {usingAudio && withSelectiveSubscription && <SelectiveSubscription />}
    </LiveKitRoom>
  );
};

const BBBLiveKitRoomContainer: React.FC = () => {
  const { data: currentUserData } = useCurrentUser((u) => ({
    livekit: u.livekit,
  }));
  const [meetingSettings] = useMeetingSettings();
  const url = meetingSettings.public.media?.livekit?.url
    || `wss://${window.location.hostname}/livekit`;
  const withSelectiveSubscription = meetingSettings.public.media?.livekit?.selectiveSubscription ?? false;
  const logLevel = meetingSettings.public.media?.livekit?.logLevel ?? LogLevel.warn;
  const roomOptions = meetingSettings.public.media?.livekit?.roomOptions ?? {
    adaptiveStream: true,
    dynacast: true,
    stopLocalTrackOnUnpublish: false,
  };
  const { data: bridges } = useMeeting((m) => ({
    cameraBridge: m.cameraBridge,
    screenShareBridge: m.screenShareBridge,
    audioBridge: m.audioBridge,
  }));
  const shouldUseLiveKit = bridges?.cameraBridge === 'livekit'
    || bridges?.screenShareBridge === 'livekit'
    || bridges?.audioBridge === 'livekit';

  if (!shouldUseLiveKit) return null;

  return (
    <BBBLiveKitRoom
      token={currentUserData?.livekit?.livekitToken}
      url={url}
      logLevel={logLevel}
      roomOptions={roomOptions}
      bbbSessionToken={Auth.sessionToken as string}
      usingAudio={bridges?.audioBridge === 'livekit'}
      usingScreenShare={bridges?.screenShareBridge === 'livekit'}
      withSelectiveSubscription={withSelectiveSubscription}
    />
  );
};

export default BBBLiveKitRoomContainer;
