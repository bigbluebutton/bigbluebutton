import { useEffect, useRef, useState } from 'react';
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
import { VoiceItem, TalkingUsersHookResult, VoiceUserMetadata } from '../types';
import { TALKING_INDICATOR_TIMEOUT } from '../constants';

const BASELINE_DATA: TalkingUsersHookResult = Object.freeze({
  error: undefined,
  data: {},
  loading: false,
});

const createUseTalkingUsersLiveKit = () => {
  const countVar = makeVar(0);
  const loadingVar = makeVar(true);
  const currentTalkingStateVar = makeVar<Record<string, boolean>>({});
  // User metadata from voiceActivity subscription
  const userMetadataVar = makeVar<Record<string, VoiceUserMetadata>>({});

  const setTalkingUserLoading = (loading: boolean) => loadingVar(loading);
  const useTalkingUserConsumersCount = () => useReactiveVar(countVar);

  const dispatchTalkingUserUpdate = (
    data?: VoiceActivityResponse['user_voice_activity_stream'],
  ) => {
    if (countVar() === 0) return;

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

    userMetadataVar(newUserMetadata);
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
    const loading = useReactiveVar(loadingVar);
    const currentTalkingState = useReactiveVar(currentTalkingStateVar);
    const mutedTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
    const spokeTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
    const [record, setRecord] = useState<Record<string, VoiceItem>>({});

    useEffect(() => {
      if (!shouldUseLiveKit) return undefined;

      countVar(countVar() + 1);
      return () => {
        countVar(countVar() - 1);
      };
    }, [shouldUseLiveKit]);

    useEffect(() => {
      if (!shouldUseLiveKit) return;

      const newTalkingState: Record<string, boolean> = { ...currentTalkingState };

      if (localParticipant && Auth.userID) {
        const localUserId = Auth.userID as string;
        if (localParticipant.isSpeaking) {
          newTalkingState[localUserId] = true;
        } else {
          delete newTalkingState[localUserId];
        }
      }

      remoteParticipants.forEach((participant) => {
        const userId = participant.identity;
        const isSubscribed = subscribedAudioUsers[userId] ?? false;

        if (isSubscribed) {
          // Use LiveKit isSpeaking for subscribed participants
          if (participant.isSpeaking) {
            newTalkingState[userId] = true;
          } else {
            delete newTalkingState[userId];
          }
        } else {
          // Use BBB fallback for unsubscribed participants
          // LiveKit only emits speaking events for subscribed tracks of remote participants.
          const bbbTalking = bbbTalkingUsers[userId]?.talking ?? false;

          if (bbbTalking) {
            newTalkingState[userId] = true;
          } else {
            delete newTalkingState[userId];
          }
        }
      });

      if (!isEqual(currentTalkingState, newTalkingState)) {
        currentTalkingStateVar(newTalkingState);
      }
    }, [
      remoteParticipants,
      localParticipant,
      subscribedAudioUsers,
      bbbTalkingUsers,
      shouldUseLiveKit,
    ]);

    useEffect(() => {
      if (!shouldUseLiveKit) return;

      const isConnected = connectionState === ConnectionState.Connected;
      setTalkingUserLoading(!isConnected);

      // When LiveKit is disconnected, use BBB state as fallback
      if (!isConnected) {
        const bbbRecord: Record<string, VoiceItem> = {};

        Object.keys(bbbTalkingUsers).forEach((userId) => {
          const talkingUser = bbbTalkingUsers[userId];

          if (talkingUser) bbbRecord[userId] = talkingUser;
        });

        if (!isEqual(record, bbbRecord)) setRecord(bbbRecord);

        return;
      }

      const allUserIds = new Set<string>();
      Object.keys(currentTalkingState).forEach((id) => allUserIds.add(id));
      Object.keys(record).forEach((id) => allUserIds.add(id));
      Object.keys(userMetadataMap).forEach((id) => allUserIds.add(id));

      const newRecord: Record<string, VoiceItem> = { ...record };

      allUserIds.forEach((userId) => {
        const talking = currentTalkingState[userId] ?? false;
        const muted = !unmutedUsers[userId];
        let userMetadata = userMetadataMap[userId];

        // No metadata for the user is found, which means the client is likely
        // not connected to BBB/gql. If the user is still connected to LK,
        // generate a baseline user metadata object. This is not 100% accurate,
        // but it's better than not having a working talking indicator while the
        // user can be heard by others - prlanzarin Jan 05 2026
        if (!userMetadata) {
          const participant = remoteParticipants.find((p) => p.identity === userId);

          if (!participant) {
            if (!currentTalkingState[userId]) delete newRecord[userId];

            return;
          }

          userMetadata = {
            name: participant.name ?? participant.identity,
          };
        }

        const previousIndicator = record[userId];
        const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
        const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

        // Handle unmuted users
        if (!muted) {
          if (!previousIndicator && !talking) {
            // Skip if no previous state and not talking
            return;
          }

          let startTime = previousIndicator?.startTime ?? 0;
          let endTime = previousIndicator?.endTime ?? 0;

          if (previousIndicator?.talking && !talking) {
            endTime = Date.now();
            startTime = 0;
          }

          if (!previousIndicator?.talking && talking) {
            startTime = Date.now();
            endTime = 0;
          }

          // Cancel any deletion if user has started talking
          if (talking) {
            if (currentSpokeTimeout) {
              clearTimeout(currentSpokeTimeout);
              spokeTimeoutRegistry.current[userId] = null;
            }
            if (currentMutedTimeout) {
              clearTimeout(currentMutedTimeout);
              mutedTimeoutRegistry.current[userId] = null;
            }
          }

          // User has stopped talking
          if (endTime && !currentSpokeTimeout) {
            spokeTimeoutRegistry.current[userId] = setTimeout(() => {
              setRecord((previousRecord) => {
                const newRecord = { ...previousRecord };
                delete newRecord[userId];
                return newRecord;
              });
            }, TALKING_INDICATOR_TIMEOUT);
          }

          newRecord[userId] = {
            ...(previousIndicator || {}),
            userId,
            muted,
            talking,
            startTime,
            endTime,
            user: userMetadata,
          };
        } else {
          // Handle muted users
          if (!previousIndicator) {
            // Remove user if they have no previous talking state.
            delete newRecord[userId];

            return;
          }

          const { startTime } = previousIndicator;
          const endTime = previousIndicator.talking
            ? Date.now()
            : previousIndicator.endTime;

          // User has never talked or exited audio
          if (!(endTime || startTime)) {
            delete newRecord[userId];

            return;
          }

          if (!currentMutedTimeout && !currentSpokeTimeout) {
            mutedTimeoutRegistry.current[userId] = setTimeout(() => {
              setRecord((previousRecord) => {
                const newRecord = { ...previousRecord };
                delete newRecord[userId];
                return newRecord;
              });
              mutedTimeoutRegistry.current[userId] = null;
            }, TALKING_INDICATOR_TIMEOUT);
          }

          newRecord[userId] = {
            ...previousIndicator,
            userId,
            muted,
            talking: false,
            startTime,
            endTime,
            user: userMetadata,
          };
        }
      });

      // Clean up users that are no longer in the room and not in LK/BBB.
      Object.keys(newRecord).forEach((userId) => {
        if (!userMetadataMap[userId] && !currentTalkingState[userId]) {
          const spokeTimeout = spokeTimeoutRegistry.current[userId];
          const mutedTimeout = mutedTimeoutRegistry.current[userId];
          if (spokeTimeout) {
            clearTimeout(spokeTimeout);
            spokeTimeoutRegistry.current[userId] = null;
          }
          if (mutedTimeout) {
            clearTimeout(mutedTimeout);
            mutedTimeoutRegistry.current[userId] = null;
          }
          delete newRecord[userId];
        }
      });

      if (!isEqual(record, newRecord)) setRecord(newRecord);
    }, [
      connectionState,
      currentTalkingState,
      unmutedUsers,
      userMetadataMap,
      record,
      remoteParticipants,
      shouldUseLiveKit,
      bbbTalkingUsers,
    ]);

    if (!shouldUseLiveKit) return BASELINE_DATA;

    return {
      error: undefined,
      loading,
      data: record,
    };
  };

  return [
    useTalkingUsers,
    useTalkingUserConsumersCount,
    setTalkingUserLoading,
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
