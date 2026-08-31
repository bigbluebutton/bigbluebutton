import { useMemo } from 'react';
import {
  useRemoteParticipants,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState, RemoteParticipant, RoomEvent } from 'livekit-client';
import { liveKitRoomRegistry } from '/imports/ui/services/livekit';
import { getBbbUserIdForParticipant } from '/imports/ui/components/livekit/selective-subscription/service';
import Auth from '/imports/ui/services/auth';
import useWhoIsUnmutedLiveKit from './useWhoIsUnmutedLiveKit';
import { useIsUsingLiveKitAudio } from './useShouldUseLiveKitAudioState';
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
  // User metadata from voiceActivity subscription
  const {
    useData,
    useConsumersCount,
    setLoading,
    getState,
    dispatch,
  } = createReactiveStateHook<Record<string, VoiceUserMetadata>>({});

  // Merges, never evicts: the talking indicator treats absence from a LiveKit pass as
  // a departure, so every user this has ever seen has to keep being offered to it.
  const dispatchTalkingUserUpdate = (
    data?: VoiceActivityResponse['user_voice_activity_stream'],
  ) => {
    if (!data) return;

    // Extract user metadata from voiceActivity data
    const newUserMetadata: Record<string, VoiceUserMetadata> = {
      ...getState(),
    };

    data.forEach((voice) => {
      const { userId, user } = voice;
      newUserMetadata[userId] = {
        name: user.name,
        color: user?.color,
        speechLocale: user?.speechLocale,
      };
    });

    dispatch(newUserMetadata);
  };

  const useTalkingUsers = () => {
    // Activation of this hook is based on LK usage, not an opt-in config. The
    // hook router overlays these entries onto server voice-activity so LiveKit-audible
    // users without a server voice record (e.g. a transferred moderator in a
    // breakout) still get a talking indicator.
    const isLiveKitActive = useIsUsingLiveKitAudio();
    const room = liveKitRoomRegistry.getPrimary();
    const remoteParticipants = useRemoteParticipants({
      room,
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.ActiveSpeakersChanged,
        RoomEvent.Connected,
      ],
    });
    const { localParticipant } = useLocalParticipant({ room });
    const connectionState = useConnectionState(room);
    const subscribedAudioUsers = useSubscribedAudioUsers();
    const { data: bbbTalkingUsers } = useTalkingUsersGraphql();
    // Consume the LiveKit unmuted source directly (not the opt-in router)
    // so mute state is correct whenever LiveKit is the bridge - see isLiveKitActive.
    const { data: unmutedUsers } = useWhoIsUnmutedLiveKit();
    const { data: userMetadataMap, loading } = useData();
    const isConnected = connectionState === ConnectionState.Connected;
    const participantsByUserId = useMemo(() => {
      const participants = new Map<string, RemoteParticipant>();

      remoteParticipants.forEach((participant) => {
        participants.set(participant.identity, participant);
        // Dial-in/voice-only participants are tracked by BBB as v_<sid>, which never
        // matches their LiveKit identity, so index them under both keys
        participants.set(getBbbUserIdForParticipant(participant), participant);
      });

      return participants;
    }, [remoteParticipants]);

    // Build raw voice activity from LiveKit state
    const rawVoiceActivity = useMemo<RawVoiceActivityItem[] | undefined>(() => {
      if (!isLiveKitActive || !isConnected) return undefined;

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
          const participant = participantsByUserId.get(userId);

          // LiveKit only emits speaking events for subscribed tracks
          if (isSubscribed && participant) {
            talking = participant.isSpeaking;
          } else if (participant) {
            // Fallback to BBB state (unsubscribed track). Users that are gone from
            // the room keep talking = false: their BBB record may still read talking
            // if they crashed mid-speech and it would resurrect the indicator
            talking = bbbTalkingUsers[userId]?.talking ?? false;
          }
        }

        let userMetadata = userMetadataMap[userId];

        if (!userMetadata) {
          const participant = isLocalUser
            ? localParticipant
            : participantsByUserId.get(userId);

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
      isLiveKitActive,
      isConnected,
      localParticipant,
      remoteParticipants,
      participantsByUserId,
      subscribedAudioUsers,
      bbbTalkingUsers,
      unmutedUsers,
      userMetadataMap,
    ]);

    // Apply timing logic to the voice activity state. Every pass rebuilds the full
    // user set from room state, so it doubles as the snapshot the indicator reconciles
    // departures against - participants with no server voice record (a moderator
    // listening into a breakout, dial-in participants) have nothing else to retire them.
    const processedData = useTimedTalkingIndicator(
      rawVoiceActivity,
      isLiveKitActive && isConnected,
      true,
    );

    if (!isLiveKitActive) return BASELINE_DATA;

    return {
      error: undefined,
      // The fallback below is only as good as the BBB state backing it, so
      // report its loading state while LiveKit is not connected
      loading: isConnected ? false : loading,
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
