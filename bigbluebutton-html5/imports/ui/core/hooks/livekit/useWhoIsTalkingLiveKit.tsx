import { useEffect, useMemo } from 'react';
import { isEqual } from 'radash';
import {
  useRemoteParticipants,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import Auth from '/imports/ui/services/auth';
import useShouldUseLiveKitAudioState from './useShouldUseLiveKitAudioState';
import useSubscribedAudioUsers from './useSubscribedAudioUsers';
import useWhoIsTalkingGraphql from '../useWhoIsTalkingGraphql';
import createReactiveRecordStateHook from '../createReactiveRecordStateHook';
import { TalkingUsersState, TalkingUserState } from '../useWhoIsTalking';

const BASELINE_DATA: TalkingUsersState = Object.freeze({
  data: {},
  loading: false,
});

const BASELINE_USER_DATA: TalkingUserState = Object.freeze({
  data: undefined,
  loading: false,
});

type UseWhoIsTalkingLiveKitHook = {
  (): TalkingUsersState;
  (userId: string): TalkingUserState;
};

const createUseWhoIsTalkingLiveKit = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    setState,
    getState,
  } = createReactiveRecordStateHook();

  /**
   * Hook to get talking users state from LiveKit.
   * Supports both full state and per-user granular subscriptions.
   *
   * @overload useWhoIsTalking() - Returns all talking users
   * @overload useWhoIsTalking(userId) - Returns single user's state
   */
  function useWhoIsTalking(): TalkingUsersState;
  function useWhoIsTalking(userId: string): TalkingUserState;
  function useWhoIsTalking(userId?: string): TalkingUsersState | TalkingUserState {
    const shouldUseLiveKit = useShouldUseLiveKitAudioState();
    const whoIsTalkingData = userId !== undefined ? useData(userId) : useData();
    const remoteParticipants = useRemoteParticipants({
      room: liveKitRoom,
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.ActiveSpeakersChanged,
        RoomEvent.Connected,
      ],
    });
    const { localParticipant } = useLocalParticipant({ room: liveKitRoom });
    const connectionState = useConnectionState(liveKitRoom);
    const subscribedAudioUsers = useSubscribedAudioUsers();
    const bbbTalkingUsersData = userId !== undefined
      ? useWhoIsTalkingGraphql(userId)
      : useWhoIsTalkingGraphql();
    const bbbTalkingUsers: Record<string, boolean> = useMemo(() => {
      if (userId !== undefined) return bbbTalkingUsersData.data === true ? { [userId]: true } : {};

      return bbbTalkingUsersData.data as Record<string, boolean>;
    }, [userId, bbbTalkingUsersData.data]);

    useEffect(() => {
      if (!shouldUseLiveKit) return;

      const isConnected = connectionState === ConnectionState.Connected;
      setLoading(!isConnected);

      // When LiveKit is disconnected, use BBB state as fallback
      if (!isConnected) {
        const bbbState = bbbTalkingUsers || {};

        if (!isEqual(getState(), bbbState)) setState(bbbState);

        return;
      }

      const newTalkingUsers: Record<string, boolean> = {};

      if (localParticipant && Auth.userID) {
        const localUserId = Auth.userID as string;

        if (localParticipant.isSpeaking) {
          newTalkingUsers[localUserId] = true;
        }
      }

      // Handle remote participants - use LK if subscribed, otherwise BBB as fallback
      // LiveKit only emits speaking events for subscribed tracks
      remoteParticipants.forEach((participant) => {
        const userId = participant.identity;
        const isSubscribed = subscribedAudioUsers[userId] ?? false;

        if (isSubscribed) {
          if (participant.isSpeaking) newTalkingUsers[userId] = true;
        } else if (bbbTalkingUsers[userId]) {
          newTalkingUsers[userId] = true;
        }
      });

      if (!isEqual(getState(), newTalkingUsers)) setState(newTalkingUsers);
    }, [
      remoteParticipants,
      localParticipant,
      connectionState,
      shouldUseLiveKit,
      subscribedAudioUsers,
      bbbTalkingUsers,
    ]);

    if (!shouldUseLiveKit) return userId !== undefined ? BASELINE_USER_DATA : BASELINE_DATA;

    return whoIsTalkingData as TalkingUsersState | TalkingUserState;
  }

  return {
    useWhoIsTalking: useWhoIsTalking as UseWhoIsTalkingLiveKitHook,
    useWhoIsTalkingConsumersCount: useConsumersCount,
    setWhoIsTalkingLoading: setLoading,
  };
};

const {
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
} = createUseWhoIsTalkingLiveKit();

export {
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
};

export default useWhoIsTalking;
