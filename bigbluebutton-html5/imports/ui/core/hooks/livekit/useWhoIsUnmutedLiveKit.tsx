import { useEffect } from 'react';
import { isEqual } from 'radash';
import {
  useRemoteParticipants,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState, RoomEvent, Track } from 'livekit-client';
import { liveKitRoomRegistry } from '/imports/ui/services/livekit';
import Auth from '/imports/ui/services/auth';
import useShouldUseLiveKitAudioState from './useShouldUseLiveKitAudioState';
import useWhoIsUnmutedGraphql from '../useWhoIsUnmutedGraphql';
import createReactiveRecordStateHook from '../createReactiveRecordStateHook';
import { UnmutedUsersState, UnmutedUserState } from '../useWhoIsUnmuted';

const BASELINE_DATA: UnmutedUsersState = Object.freeze({
  data: {},
  loading: false,
});

const BASELINE_USER_DATA: UnmutedUserState = Object.freeze({
  data: undefined,
  loading: false,
});

type UseWhoIsUnmutedLiveKitHook = {
  (): UnmutedUsersState;
  (userId: string): UnmutedUserState;
  (userId?: string): UnmutedUsersState | UnmutedUserState;
};

const createUseWhoIsUnmutedLiveKit = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    setState,
    getState,
  } = createReactiveRecordStateHook();

  /**
   * Hook to get unmuted users state from LiveKit.
   * Supports both full state and per-user granular subscriptions.
   *
   * @overload useWhoIsUnmuted() - Returns all unmuted users
   * @overload useWhoIsUnmuted(userId) - Returns single user's state
   */
  function useWhoIsUnmuted(): UnmutedUsersState;
  function useWhoIsUnmuted(userId: string): UnmutedUserState;
  function useWhoIsUnmuted(userId?: string): UnmutedUsersState | UnmutedUserState {
    const shouldUseLiveKit = useShouldUseLiveKitAudioState();
    const whoIsUnmutedData = useData(userId);
    const room = liveKitRoomRegistry.getPrimary();
    const remoteParticipants = useRemoteParticipants({
      room,
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
    const { localParticipant, microphoneTrack } = useLocalParticipant({ room });
    const connectionState = useConnectionState(room);
    // Always read the full BBB record: the effect below writes the shared state,
    // so narrowing it to userId would blank every other user for every consumer.
    // userId filters on the read side only, through useData above.
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

    if (!shouldUseLiveKit) return userId !== undefined ? BASELINE_USER_DATA : BASELINE_DATA;

    return whoIsUnmutedData as UnmutedUsersState | UnmutedUserState;
  }

  return {
    useWhoIsUnmuted: useWhoIsUnmuted as UseWhoIsUnmutedLiveKitHook,
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
