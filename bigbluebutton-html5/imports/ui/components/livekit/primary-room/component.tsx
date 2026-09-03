/* eslint no-underscore-dangle: 0 */
import React, {
  useCallback, useEffect, useRef, useState, useMemo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useReactiveVar } from '@apollo/client';
import {
  RoomAudioRenderer,
  useLocalParticipant,
  useIsSpeaking,
  useConnectionState,
  useConnectionQualityIndicator,
  useAudioPlayback,
} from '@livekit/components-react';
import {
  ConnectionQuality,
  ConnectionState,
  LogLevel,
  RoomEvent,
  type Room,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import {
  liveKitRoomRegistry,
  resolveRoomOptions,
  PRIMARY_KEY,
} from '/imports/ui/services/livekit';
import {
  USER_SET_DEAFENED,
  USER_SET_TALKING,
} from '/imports/ui/components/livekit/mutations';
import LKAutoplayModalContainer from '/imports/ui/components/livekit/autoplay-modal/container';
import { notify } from '/imports/ui/services/notification';
import connectionStatus, { MetricStatus } from '/imports/ui/core/graphql/singletons/connectionStatus';
import SelectiveSubscription from '/imports/ui/components/livekit/selective-subscription/component';
import { useSpeakerLevel } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import BaseLiveKitRoom from '/imports/ui/components/livekit/base-room/component';
import {
  useHasActiveNonPrimaryMembership,
  type LiveKitRoomRow,
} from '/imports/ui/components/livekit/memberships-manager/hooks';

const intlMessages = defineMessages({
  mediaReconnecting: {
    id: 'app.media.mediaReconnecting',
    description: 'Media reconnection in progress toast message',
  },
});

// Long enough that a resume landing in well under a second does not flicker
// the speaker indicator for everyone in the meeting.
const TALKING_CLEAR_GRACE_MS = 500;

interface PrimaryLiveKitRoomProps {
  membership: LiveKitRoomRow;
}

interface PrimaryObserverProps {
  room: Room;
  url: string;
  usingAudio: boolean;
}

const PrimaryObserver: React.FC<PrimaryObserverProps> = ({ room, url, usingAudio }) => {
  const { localParticipant } = useLocalParticipant();
  const [setUserTalking] = useMutation(USER_SET_TALKING);
  const [setUserDeafened] = useMutation(USER_SET_DEAFENED);
  const isSpeaking = useIsSpeaking(localParticipant);
  const connectionState = useConnectionState(room);
  const { quality } = useConnectionQualityIndicator({ participant: localParticipant });
  // @ts-ignore
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore
  const isDeafened = useReactiveVar(AudioManager._isDeafened.value) as boolean;

  useEffect(() => {
    logger.info({
      logCode: 'livekit_primary_conn_state',
      extraInfo: { connectionState, url },
    }, `LK primary: ${connectionState}`);
  }, [connectionState, url]);

  // livekit-client only moves the speaking flag on the active-speaker events of
  // a live session, so a room that stops carrying anything freezes it at its
  // last value, and it stays frozen once the room returns until a fresh update
  // arrives. A frozen `true` must not be published: it holds the floor for a
  // user who is transmitting nothing.
  const isRoomConnected = connectionState === ConnectionState.Connected;
  const speakingIsFrozen = useRef(false);

  useEffect(() => {
    if (!usingAudio) return undefined;

    if (!isRoomConnected) {
      speakingIsFrozen.current = true;
      const timer = setTimeout(() => {
        setUserTalking({ variables: { talking: false } });
      }, TALKING_CLEAR_GRACE_MS);

      return () => clearTimeout(timer);
    }

    if (speakingIsFrozen.current) {
      if (isSpeaking) return undefined;

      speakingIsFrozen.current = false;
    }

    setUserTalking({ variables: { talking: isSpeaking } });

    return undefined;
  }, [isSpeaking, isMuted, usingAudio, isRoomConnected]);

  useEffect(() => {
    if (!usingAudio) return;

    setUserDeafened({ variables: { deafened: isDeafened } });
  }, [isDeafened, usingAudio]);

  useEffect(() => {
    let mappedQuality = MetricStatus.Normal;

    switch (quality) {
      case ConnectionQuality.Good: mappedQuality = MetricStatus.Warning; break;
      case ConnectionQuality.Poor: mappedQuality = MetricStatus.Danger; break;
      case ConnectionQuality.Lost: mappedQuality = MetricStatus.Critical; break;
      default: mappedQuality = MetricStatus.Normal; break;
    }

    connectionStatus.setLiveKitConnectionStatus(mappedQuality);
  }, [quality]);

  useEffect(() => {
    const handleSignalConnected = () => {
      logger.info({ logCode: 'livekit_primary_signal_connected' }, 'LK primary signal connected');
    };
    room.on(RoomEvent.SignalConnected, handleSignalConnected);

    return () => { room.off(RoomEvent.SignalConnected, handleSignalConnected); };
  }, [room]);

  return null;
};

const PrimaryLiveKitRoom: React.FC<PrimaryLiveKitRoomProps> = ({ membership }) => {
  const intl = useIntl();
  const [meetingSettings] = useMeetingSettings();
  const url = meetingSettings.public.media?.livekit?.url ?? `wss://${window.location.hostname}/livekit`;
  const withSelectiveSubscription = meetingSettings.public.media?.livekit?.selectiveSubscription?.enabled ?? true;
  const logLevel = meetingSettings.public.media?.livekit?.logLevel ?? LogLevel.warn;
  const configuredRoomOptions = meetingSettings.public.media?.livekit?.roomOptions;
  // A fresh object per render would re-run the room-options effect downstream.
  const roomOptions = useMemo(() => resolveRoomOptions(configuredRoomOptions), [configuredRoomOptions]);
  const reconnectOnFatalFailures = meetingSettings.public.media?.livekit?.reconnectOnFatalFailures ?? true;
  const speakerLevel = useSpeakerLevel();
  const { data: bridges } = useMeeting((m) => ({
    cameraBridge: m.cameraBridge,
    screenShareBridge: m.screenShareBridge,
    audioBridge: m.audioBridge,
  }));
  const usingAudio = bridges?.audioBridge === 'livekit';
  const usingScreenShare = bridges?.screenShareBridge === 'livekit';
  const withAudioPlayback = usingAudio || usingScreenShare;
  // Do not render the autoplay tracker unless explicitly necessary (either
  // primary or secondary room playback actually fails)
  const hasActiveSecondary = useHasActiveNonPrimaryMembership();
  const [room] = useState(() => liveKitRoomRegistry.acquire(PRIMARY_KEY, roomOptions));
  const { canPlayAudio } = useAudioPlayback(room);

  useEffect(() => {
    return () => {
      liveKitRoomRegistry.release(PRIMARY_KEY);
    };
  }, []);

  const onFatalReconnect = useCallback(() => {
    notify(intl.formatMessage(intlMessages.mediaReconnecting), 'warning', 'warning');
  }, [intl]);

  const { sessionToken } = Auth;
  if (!membership.token || typeof sessionToken !== 'string') return null;

  return (
    <BaseLiveKitRoom
      membershipKey={PRIMARY_KEY}
      room={room}
      url={url}
      token={membership.token}
      bbbSessionToken={sessionToken}
      roomOptions={roomOptions}
      logLevel={logLevel}
      audio={false}
      video={false}
      withAutoSubscribe={!withSelectiveSubscription}
      reconnectOnFatalFailures={reconnectOnFatalFailures}
      logPrefix="livekit_primary"
      onFatalReconnect={onFatalReconnect}
    >
      <PrimaryObserver room={room} url={url} usingAudio={usingAudio} />
      {withAudioPlayback && (!hasActiveSecondary || !canPlayAudio) && <LKAutoplayModalContainer />}
      {withAudioPlayback && <RoomAudioRenderer volume={speakerLevel} />}
      {usingAudio && withSelectiveSubscription && <SelectiveSubscription />}
    </BaseLiveKitRoom>
  );
};

export default PrimaryLiveKitRoom;
