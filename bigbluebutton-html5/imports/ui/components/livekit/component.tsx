import React, { useEffect } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useIsSpeaking,
  useConnectionState,
} from '@livekit/components-react';
import {
  type Room,
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
import { USER_SET_TALKING } from '/imports/ui/components/livekit/mutations';
import { useIceServers } from '/imports/ui/components/livekit/hooks';

interface BBBLiveKitRoomProps {
  url?: string;
  token?: string;
  bbbSessionToken: string;
}

interface ObserverProps {
  room: Room;
  url?: string;
}

const LiveKitObserver = ({ room, url }: ObserverProps) => {
  const { localParticipant } = useLocalParticipant();
  const [setUserTalking] = useMutation(USER_SET_TALKING);
  const isSpeaking = useIsSpeaking(localParticipant);
  const connectionState = useConnectionState(room);
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;

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
    setUserTalking({
      variables: {
        talking: isSpeaking,
      },
    });
  }, [isSpeaking, isMuted]);

  return null;
};

const BBBLiveKitRoom: React.FC<BBBLiveKitRoomProps> = (props) => {
  const {
    url,
    token,
    bbbSessionToken,
  } = props;
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
      <LiveKitObserver room={liveKitRoom} url={url} />
      <RoomAudioRenderer />
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
      bbbSessionToken={Auth.sessionToken as string}
    />
  );
};

export default BBBLiveKitRoomContainer;
