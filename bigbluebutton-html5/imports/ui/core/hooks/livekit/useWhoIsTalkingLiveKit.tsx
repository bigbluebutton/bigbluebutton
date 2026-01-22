import { useEffect } from 'react';
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
import createReactiveStateHook from '../createReactiveStateHook';
import { TalkingUsersState } from '../types';

const BASELINE_DATA: TalkingUsersState = Object.freeze({
  data: {},
  loading: false,
});

const createUseWhoIsTalkingLiveKit = () => {
  const {
    useData,
    useConsumersCount,
    setLoading,
    setState,
    getState,
  } = createReactiveStateHook<Record<string, boolean>>({});

  const useWhoIsTalking = () => {
    const shouldUseLiveKit = useShouldUseLiveKitAudioState();
    const { data: talkingUsers, loading } = useData();
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
    const { data: bbbTalkingUsers } = useWhoIsTalkingGraphql();

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

    if (!shouldUseLiveKit) return BASELINE_DATA;

    return { data: talkingUsers, loading };
  };

  return {
    useWhoIsTalking,
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
