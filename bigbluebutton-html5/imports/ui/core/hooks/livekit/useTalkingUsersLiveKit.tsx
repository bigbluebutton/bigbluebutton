import { useEffect, useMemo } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import { isEqual } from 'radash';
import {
  useRemoteParticipants,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import Auth from '/imports/ui/services/auth';
import useWhoIsUnmuted from '../useWhoIsUnmuted';
import useShouldUseLiveKitAudioState from './useShouldUseLiveKitAudioState';
import useSubscribedAudioUsers from './useSubscribedAudioUsers';
import useTalkingUsersGraphql from '../useTalkingUsersGraphql';
import { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/voiceActivity';
import { TalkingUsersHookResult } from '../useTalkingUsers';
import { VoiceUserMetadata } from '../types';
import useTimedTalkingIndicator, { RawVoiceActivityItem } from '../useTimedTalkingIndicator';
import createReactiveStateHook from '../createReactiveStateHook';

const BASELINE_DATA: TalkingUsersHookResult = Object.freeze({
  error: undefined,
  data: {},
  loading: false,
});

const createUseTalkingUsersLiveKit = () => {
  const {
    useConsumersCount,
    setLoading,
  } = createReactiveStateHook<Record<string, VoiceUserMetadata>>({});
  // User metadata from voiceActivity subscription
  const userMetadataVar = makeVar<Record<string, VoiceUserMetadata>>({});

  const dispatchTalkingUserUpdate = (
    data?: VoiceActivityResponse['user_voice_activity_stream'],
  ) => {
    if (!data) return;

    // Extract user metadata from voiceActivity data
    const newUserMetadata: Record<string, VoiceUserMetadata> = {
      ...userMetadataVar(),
    };

    data.forEach((voice) => {
      const { userId, user } = voice;
      newUserMetadata[userId] = {
        name: user.name,
        color: user?.color,
        speechLocale: user?.speechLocale,
      };
    });

    if (!isEqual(userMetadataVar(), newUserMetadata)) {
      userMetadataVar(newUserMetadata);
    }
  };

  const useTalkingUsers = () => {
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
    const { data: bbbTalkingUsers } = useTalkingUsersGraphql();
    const { data: unmutedUsers } = useWhoIsUnmuted();
    const userMetadataMap = useReactiveVar(userMetadataVar);
    const isConnected = connectionState === ConnectionState.Connected;

    useEffect(() => {
      if (!shouldUseLiveKit) return;

      setLoading(!isConnected);
    }, [isConnected, shouldUseLiveKit]);

    // Build raw voice activity from LiveKit state
    const rawVoiceActivity = useMemo<RawVoiceActivityItem[] | undefined>(() => {
      if (!shouldUseLiveKit || !isConnected) return undefined;

      const voiceActivityItems: RawVoiceActivityItem[] = [];
      const allUserIds = new Set<string>();

      // Assemble all user IDs that might be talking
      if (localParticipant && Auth.userID) allUserIds.add(Auth.userID as string);
      remoteParticipants.forEach((participant) => allUserIds.add(participant.identity));
      // Add users from metadata (may have talked before)
      Object.keys(userMetadataMap).forEach((id) => allUserIds.add(id));

      // Determine talking state for each user
      allUserIds.forEach((userId) => {
        const isLocalUser = userId === Auth.userID;
        const muted = !unmutedUsers[userId];

        let talking = false;

        if (isLocalUser) {
          talking = localParticipant?.isSpeaking ?? false;
        } else {
          const isSubscribed = subscribedAudioUsers[userId] ?? false;
          const participant = remoteParticipants.find(
            (participant) => participant.identity === userId,
          );

          // LiveKit only emits speaking events for subscribed tracks
          if (isSubscribed && participant) {
            talking = participant.isSpeaking;
          } else {
            // Fallback to BBB state as fallback (unsubscribed or no participant data)
            talking = bbbTalkingUsers[userId]?.talking ?? false;
          }
        }

        let userMetadata = userMetadataMap[userId];

        if (!userMetadata) {
          const participant = isLocalUser
            ? localParticipant
            : remoteParticipants.find((participant) => participant.identity === userId);

          if (!participant) return;

          // Baseline user metadata for users that are not in the metadata map
          // This is not 100% accurate, but it's better than not having a working
          // talking indicator while the user can be heard by others - prlanzarin Jan 05 2026
          userMetadata = {
            name: participant.name ?? participant.identity,
          };
        }

        voiceActivityItems.push({
          userId,
          talking,
          muted,
          user: userMetadata,
        });
      });

      return voiceActivityItems;
    }, [
      shouldUseLiveKit,
      isConnected,
      localParticipant,
      remoteParticipants,
      subscribedAudioUsers,
      bbbTalkingUsers,
      unmutedUsers,
      userMetadataMap,
    ]);

    // Apply timing logic to the voice activity state
    const processedData = useTimedTalkingIndicator(
      rawVoiceActivity,
      shouldUseLiveKit && isConnected,
    );

    if (!shouldUseLiveKit) return BASELINE_DATA;

    return {
      error: undefined,
      loading: false,
      // When LiveKit is connected, use the processed data, otherwise use the BBB
      // processed data as fallback
      data: isConnected ? processedData : bbbTalkingUsers,
    };
  };

  return [
    useTalkingUsers,
    useConsumersCount,
    setLoading,
    dispatchTalkingUserUpdate,
  ] as const;
};

const [
  useTalkingUsers,
  useTalkingUserConsumersCount,
  setTalkingUserLoading,
  dispatchTalkingUserUpdate,
] = createUseTalkingUsersLiveKit();

export {
  useTalkingUserConsumersCount,
  setTalkingUserLoading,
  dispatchTalkingUserUpdate,
};

export default useTalkingUsers;
