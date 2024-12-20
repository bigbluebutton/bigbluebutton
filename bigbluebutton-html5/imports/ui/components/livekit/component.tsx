import React, { useEffect } from 'react';
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
  ConnectionState,
  type Room,
  type InternalRoomOptions,
  type RoomConnectOptions,
  ConnectionQuality,
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
import { USER_SET_TALKING } from '/imports/ui/components/livekit/mutations';
import { useIceServers } from '/imports/ui/components/livekit/hooks';
import LKAutoplayModalContainer from '/imports/ui/components/livekit/autoplay-modal/container';
import connectionStatus, { MetricStatus } from '/imports/ui/core/graphql/singletons/connectionStatus';
import SelectiveSubscription from '/imports/ui/components/livekit/selective-subscription/component';

interface BBBLiveKitRoomProps {
  url?: string;
  token?: string;
  roomOptions: Partial<InternalRoomOptions>;
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

const LiveKitObserver = ({
  room,
  url,
  usingAudio,
}: ObserverProps) => {
  const { localParticipant } = useLocalParticipant();
  const [setUserTalking] = useMutation(USER_SET_TALKING);
  const isSpeaking = useIsSpeaking(localParticipant);
  const connectionState = useConnectionState(room);
  const { quality } = useConnectionQualityIndicator({ participant: localParticipant });
  const { data: currentUserData } = useCurrentUser((u) => ({
    voice: {
      joined: u.voice?.joined ?? false,
    },
  }));
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore
  const isAudioManagerConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;

  useEffect(() => {
    logger.debug({
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

    // If the user is connected to LiveKit and server-side audio state is present,
    // but audio-manager is not connected, run the onAudioJoin callback to mark
    // it as connected. Reasoning: there's no option not to connect to audio
    // with LiveKit, so this ensures the client-side audio state is in sync with
    // this automatic behavior.
    if (!isAudioManagerConnected
      && connectionState === ConnectionState.Connected
      && currentUserData?.voice?.joined) {
      AudioManager.onAudioJoin();
    }
  }, [isAudioManagerConnected, currentUserData, connectionState]);

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

  return null;
};

const BBBLiveKitRoom: React.FC<BBBLiveKitRoomProps> = ({
  url,
  token,
  roomOptions,
  bbbSessionToken,
  usingAudio,
  usingScreenShare,
  withSelectiveSubscription,
}) => {
  const {
    iceServers,
    isLoading: iceServersLoading,
  } = useIceServers(bbbSessionToken);

  useEffect(() => {
    if (!token || !url || iceServersLoading) return;

    const connectOptions: RoomConnectOptions = {
      rtcConfig: {
        iceServers,
      },
    };

    liveKitRoom.options = { ...liveKitRoom.options, ...roomOptions };
    liveKitRoom.connect(url, token, connectOptions).catch((error) => {
      logger.error({
        logCode: 'livekit_connect_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
          url,
        },
      }, `Failed to connect to LiveKit room: ${error?.message}`);
    });
  }, [token, url, iceServersLoading, iceServers]);

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

  // Screen share requires audio playback as well (Chrome supports it)
  const withAudioPlayback = usingAudio || usingScreenShare;

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      connect={false}
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
  const roomOptions = meetingSettings.public.media?.livekit?.roomOptions ?? {
    adaptiveStream: true,
    dynacast: true,
    stopLocalTrackOnUnpublish: false,
  };
  const withSelectiveSubscription = meetingSettings.public.media?.livekit?.selectiveSubscription;
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
      roomOptions={roomOptions}
      bbbSessionToken={Auth.sessionToken as string}
      usingAudio={bridges?.audioBridge === 'livekit'}
      usingScreenShare={bridges?.screenShareBridge === 'livekit'}
      withSelectiveSubscription={withSelectiveSubscription}
    />
  );
};

export default BBBLiveKitRoomContainer;
