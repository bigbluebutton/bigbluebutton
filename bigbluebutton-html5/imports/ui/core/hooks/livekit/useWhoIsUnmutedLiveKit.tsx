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
import { useIsUsingLiveKitAudio } from './useShouldUseLiveKitAudioState';
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
    const isLiveKitActive = useIsUsingLiveKitAudio();
    const whoIsUnmutedData = useData(userId);

    if (!isLiveKitActive) return userId !== undefined ? BASELINE_USER_DATA : BASELINE_DATA;

    return whoIsUnmutedData as UnmutedUsersState | UnmutedUserState;
  }

  // Writes the state every consumer above reads, from the primary room. It
  // runs whenever LiveKit is the audio bridge, independent of the
  // `useLiveKitAudioState` opt-in: the router (useWhoIsUnmuted) decides which
  // source it exposes by the opt-in, but the talking-indicator hook reads this
  // store directly to reflect the mute state of audible participants with no
  // server voice record (e.g. a moderator transferred into a breakout to listen).
  // Mounted once, by LiveKitVoiceActivityAdapter: the room subscriptions below
  // re-render their host on every participant's track event.
  const useDeriveWhoIsUnmuted = () => {
    const isLiveKitActive = useIsUsingLiveKitAudio();
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
    const { data: bbbUnmutedUsers } = useWhoIsUnmutedGraphql();

    // Derive unmuted state from LiveKit participants
    useEffect(() => {
      if (!isLiveKitActive) return;

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
      isLiveKitActive,
      bbbUnmutedUsers,
    ]);
  };

  return {
    useWhoIsUnmuted: useWhoIsUnmuted as UseWhoIsUnmutedLiveKitHook,
    useWhoIsUnmutedConsumersCount: useConsumersCount,
    setWhoIsUnmutedLoading: setLoading,
    useDeriveWhoIsUnmuted,
  };
};

const {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
  useDeriveWhoIsUnmuted,
} = createUseWhoIsUnmutedLiveKit();

export {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
  useDeriveWhoIsUnmuted,
};

export default useWhoIsUnmuted;
