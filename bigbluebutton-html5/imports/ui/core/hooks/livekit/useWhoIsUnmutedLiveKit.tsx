import { useEffect } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';
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
import { UnmutedUsersState } from '../types';

const BASELINE_DATA: UnmutedUsersState = {
  data: {},
  loading: false,
};

const createUseWhoIsUnmutedLiveKit = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);

  const setWhoIsUnmutedState = (newState: Record<string, boolean>) => stateVar(newState);
  const setWhoIsUnmutedLoading = (loading: boolean) => loadingVar(loading);
  const getWhoIsUnmuted = () => stateVar();
  const useWhoIsUnmutedConsumersCount = () => useReactiveVar(countVar);
  const useWhoIsUnmuted = () => {
    const shouldUseLiveKit = useShouldUseLiveKitAudioState();
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
    const unmutedUsers = useReactiveVar(stateVar);
    const loading = useReactiveVar(loadingVar);

    useEffect(() => {
      // Only track consumers when LiveKit is actually used
      if (!shouldUseLiveKit) return undefined;

      countVar(countVar() + 1);
      return () => {
        countVar(countVar() - 1);
        if (countVar() === 0) {
          setWhoIsUnmutedState({});
        }
      };
    }, [shouldUseLiveKit]);

    useEffect(() => {
      if (!shouldUseLiveKit) return;

      const isConnected = connectionState === ConnectionState.Connected;
      setWhoIsUnmutedLoading(!isConnected);

      // When LiveKit is disconnected, use BBB state as fallback
      if (!isConnected) {
        const bbbState = bbbUnmutedUsers || {};

        if (!isEqual(getWhoIsUnmuted(), bbbState)) setWhoIsUnmutedState(bbbState);

        return;
      }

      const newUnmutedUsers: Record<string, boolean> = {};

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

      remoteParticipants.forEach((participant) => {
        const userId = participant.identity;

        participant.audioTrackPublications.forEach((publication) => {
          if (publication.source === Track.Source.Microphone && !publication.isMuted) {
            newUnmutedUsers[userId] = true;
          }
        });
      });

      if (!isEqual(getWhoIsUnmuted(), newUnmutedUsers)) {
        setWhoIsUnmutedState(newUnmutedUsers);
      }
    }, [
      remoteParticipants,
      localParticipant,
      connectionState,
      microphoneTrack,
      shouldUseLiveKit,
      bbbUnmutedUsers,
    ]);

    if (!shouldUseLiveKit) return BASELINE_DATA;

    return {
      data: unmutedUsers,
      loading,
    };
  };

  return [
    useWhoIsUnmuted,
    useWhoIsUnmutedConsumersCount,
    setWhoIsUnmutedLoading,
  ] as const;
};

const [
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
] = createUseWhoIsUnmutedLiveKit();

export {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
};

export default useWhoIsUnmuted;
