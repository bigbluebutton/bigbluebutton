import { useEffect } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar } from '@apollo/client';
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
import { TalkingUsersState } from '../types';

const BASELINE_DATA: TalkingUsersState = {
  data: {},
  loading: false,
};

const createUseWhoIsTalkingLiveKit = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);

  const setWhoIsTalkingState = (newState: Record<string, boolean>) => stateVar(newState);
  const setWhoIsTalkingLoading = (loading: boolean) => loadingVar(loading);
  const getWhoIsTalking = () => stateVar();
  const useWhoIsTalkingConsumersCount = () => useReactiveVar(countVar);
  const useWhoIsTalking = () => {
    const shouldUseLiveKit = useShouldUseLiveKitAudioState();
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
    const talkingUsers = useReactiveVar(stateVar);
    const loading = useReactiveVar(loadingVar);

    useEffect(() => {
      // Only track consumers when LiveKit is actually used
      if (!shouldUseLiveKit) return undefined;

      countVar(countVar() + 1);
      return () => {
        countVar(countVar() - 1);
        if (countVar() === 0) setWhoIsTalkingState({});
      };
    }, [shouldUseLiveKit]);

    useEffect(() => {
      if (!shouldUseLiveKit) return;

      const isConnected = connectionState === ConnectionState.Connected;

      setWhoIsTalkingLoading(!isConnected);

      // When LiveKit is disconnected, use BBB state as fallback
      if (!isConnected) {
        const bbbState = bbbTalkingUsers || {};

        if (!isEqual(getWhoIsTalking(), bbbState)) setWhoIsTalkingState(bbbState);

        return;
      }

      const newTalkingUsers: Record<string, boolean> = {};

      if (localParticipant && Auth.userID) {
        const localUserId = Auth.userID as string;

        if (localParticipant.isSpeaking) {
          newTalkingUsers[localUserId] = true;
        }
      }

      // For remote users, use LK if subscribed, otherwise BBB.
      // LiveKit only emits speaking events for subscribed tracks and we *want*
      // talking state to be shown regardless.
      remoteParticipants.forEach((participant) => {
        const userId = participant.identity;
        const isSubscribed = subscribedAudioUsers[userId] ?? false;

        if (isSubscribed) {
          if (participant.isSpeaking) newTalkingUsers[userId] = true;
        } else if (bbbTalkingUsers[userId]) {
          newTalkingUsers[userId] = true;
        }
      });

      if (!isEqual(getWhoIsTalking(), newTalkingUsers)) {
        setWhoIsTalkingState(newTalkingUsers);
      }
    }, [
      remoteParticipants,
      localParticipant,
      connectionState,
      shouldUseLiveKit,
      subscribedAudioUsers,
      bbbTalkingUsers,
    ]);

    // Short-circuit when LiveKit is not used to prevent unnecessary re-renders
    // Return stable empty values to ensure no re-renders are triggered
    if (!shouldUseLiveKit) return BASELINE_DATA;

    return {
      data: talkingUsers,
      loading,
    };
  };

  return [
    useWhoIsTalking,
    useWhoIsTalkingConsumersCount,
    setWhoIsTalkingLoading,
  ] as const;
};

const [
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
] = createUseWhoIsTalkingLiveKit();

export {
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
};

export default useWhoIsTalking;
