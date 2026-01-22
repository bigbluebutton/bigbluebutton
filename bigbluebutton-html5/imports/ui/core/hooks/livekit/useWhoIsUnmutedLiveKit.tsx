import { useEffect } from 'react';
import { isEqual } from 'radash';
import {
  useRemoteParticipants,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState, RoomEvent, Track } from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import Auth from '/imports/ui/services/auth';
import useShouldUseLiveKitAudioState from './useShouldUseLiveKitAudioState';
import useWhoIsUnmutedGraphql from '../useWhoIsUnmutedGraphql';
import createReactiveStateHook from '../createReactiveStateHook';
import { UnmutedUsersState } from '../types';

const BASELINE_DATA: UnmutedUsersState = Object.freeze({
  data: {},
  loading: false,
});

const createUseWhoIsUnmutedLiveKit = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    setState,
    getState,
  } = createReactiveStateHook<Record<string, boolean>>({});

  const useWhoIsUnmuted = () => {
    const shouldUseLiveKit = useShouldUseLiveKitAudioState();
    const { data: unmutedUsers, loading } = useData();
    const remoteParticipants = useRemoteParticipants({
      room: liveKitRoom,
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.TrackPublished,
        RoomEvent.TrackUnpublished,
        RoomEvent.TrackMuted,
        RoomEvent.TrackUnmuted,
        RoomEvent.Connected,
      ],
    });
    const { localParticipant, microphoneTrack } = useLocalParticipant({ room: liveKitRoom });
    const connectionState = useConnectionState(liveKitRoom);
    const { data: bbbUnmutedUsers } = useWhoIsUnmutedGraphql();

    // Derive unmuted state from LiveKit participants
    useEffect(() => {
      if (!shouldUseLiveKit) return;

      const isConnected = connectionState === ConnectionState.Connected;
      setLoading(!isConnected);

      // When LiveKit is disconnected, use BBB state as fallback
      if (!isConnected) {
        const bbbState = bbbUnmutedUsers || {};

        if (!isEqual(getState(), bbbState)) setState(bbbState);

        return;
      }

      const newUnmutedUsers: Record<string, boolean> = {};

      // Handle local participant
      if (localParticipant && Auth.userID) {
        const localUserId = Auth.userID as string;

        if (microphoneTrack && !microphoneTrack.isMuted) {
          newUnmutedUsers[localUserId] = true;
        } else {
          localParticipant.audioTrackPublications.forEach((publication) => {
            if (publication.source === Track.Source.Microphone && !publication.isMuted) {
              newUnmutedUsers[localUserId] = true;
            }
          });
        }
      }

      // Handle remote participants
      remoteParticipants.forEach((participant) => {
        const userId = participant.identity;

        participant.audioTrackPublications.forEach((publication) => {
          if (publication.source === Track.Source.Microphone && !publication.isMuted) {
            newUnmutedUsers[userId] = true;
          }
        });
      });

      if (!isEqual(getState(), newUnmutedUsers)) setState(newUnmutedUsers);
    }, [
      remoteParticipants,
      localParticipant,
      connectionState,
      microphoneTrack,
      shouldUseLiveKit,
      bbbUnmutedUsers,
    ]);

    if (!shouldUseLiveKit) return BASELINE_DATA;

    return { data: unmutedUsers, loading };
  };

  return {
    useWhoIsUnmuted,
    useWhoIsUnmutedConsumersCount: useConsumersCount,
    setWhoIsUnmutedLoading: setLoading,
  };
};

const {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
} = createUseWhoIsUnmutedLiveKit();

export {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
};

export default useWhoIsUnmuted;
