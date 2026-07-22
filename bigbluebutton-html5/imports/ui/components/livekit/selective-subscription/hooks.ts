import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  RoomEvent,
  RemoteParticipant,
  Track,
  type RemoteTrackPublication,
  type Room,
} from 'livekit-client';
import { useReactiveVar } from '@apollo/client';
import { useRemoteParticipants, useSpeakingParticipants } from '@livekit/components-react';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import {
  MEDIA_GROUP_STREAMS_SUBSCRIPTION,
} from '/imports/ui/components/livekit/selective-subscription/queries';
import {
  MediaGroupStream,
  MediaSendersData,
  MediaType,
  PUBLIC_GROUP_IDS,
} from '/imports/ui/components/livekit/selective-subscription/types';
import {
  getBbbUserIdForParticipant,
  isAudioSource,
  selectParticipantsToSubscribe,
} from '/imports/ui/components/livekit/selective-subscription/service';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';
import AudioManager from '/imports/ui/services/audio-manager';
import { useAutoplayState } from '/imports/ui/components/livekit/autoplay-modal/hooks';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';

const PARTICIPANTS_UPDATE_FILTER = [
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ConnectionStateChanged,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.TrackSubscriptionPermissionChanged,
  RoomEvent.TrackSubscriptionStatusChanged,
  RoomEvent.TrackSubscribed,
  RoomEvent.TrackUnsubscribed,
  RoomEvent.TrackSubscriptionFailed,
  RoomEvent.ActiveSpeakersChanged,
];

const useMediaGroupStreamsSubscription = createUseSubscription(
  MEDIA_GROUP_STREAMS_SUBSCRIPTION,
  {},
  true,
);

const getSelectiveSubscriptionConfig = () => {
  const selSubConfig = window.meetingClientSettings?.public?.media?.livekit?.selectiveSubscription;
  const selectiveSubscriptionEnabled = selSubConfig?.enabled ?? true;
  const audioSubscriptionPoolSize = selectiveSubscriptionEnabled
    ? selSubConfig?.audioSubscriptionPoolSize ?? 0
    : 0;

  return {
    selectiveSubscriptionEnabled,
    audioSubscriptionPoolSize,
    muteDebounceMs: selSubConfig?.muteDebounceMs ?? 2500,
  };
};

/**
 * Hook to track LiveKit participant's speaking activity timestamps
 * @param liveKitRoom - The LiveKit room
 * @returns A map of participant IDs to their last spoke timestamp
 */
const useParticipantsLastSpokeAt = (
  liveKitRoom: Room,
): Map<string, number> => {
  const speakingParticipants = useSpeakingParticipants();
  const participantsLastSpokeAtMap = useRef<Map<string, number>>(new Map());
  const [participantLastSpokeAt, setParticipantLastSpokeAt] = useState<Map<string, number>>(new Map());

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    if (participantsLastSpokeAtMap.current.delete(participant.identity)) {
      setParticipantLastSpokeAt(new Map(participantsLastSpokeAtMap.current));
    }
  }, []);

  useEffect(() => {
    let changed = false;

    speakingParticipants.forEach((participant) => {
      const { lastSpokeAt, identity } = participant;
      const existing = participantsLastSpokeAtMap.current.get(identity);
      const lastSpokeAtMs = lastSpokeAt instanceof Date
        ? lastSpokeAt.getTime()
        : undefined;

      if (lastSpokeAtMs !== undefined && existing !== lastSpokeAtMs) {
        participantsLastSpokeAtMap.current.set(identity, lastSpokeAtMs);
        changed = true;
      }
    });

    if (changed) setParticipantLastSpokeAt(new Map(participantsLastSpokeAtMap.current));
  }, [speakingParticipants]);

  useEffect(() => {
    liveKitRoom.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      liveKitRoom.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [handleParticipantDisconnected]);

  return participantLastSpokeAt;
};

/**
 * Provides a debounced mute state for LiveKit participants.
 * @param participants - The remote participants
 * @param debounceMs - The debounce time in milliseconds
 * @returns A record of participant IDs to their debounced mute state
 */
const useDebouncedMuteState = (
  participants: RemoteParticipant[],
  debounceMs: number = 2500,
): Record<string, boolean> => {
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const [debouncedState, setDebouncedState] = useState<Record<string, boolean>>(unmutedUsers || {});
  const debouncedStateRef = useRef(debouncedState);
  debouncedStateRef.current = debouncedState;
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    participants.forEach((participant) => {
      const userId = participant.identity;
      // useWhoIsUnmuted stores keys by LK identity when LK is connected and
      // by BBB intId when it falls back to the graphql source on LK
      // disconnect. Check if either variants exist (userId or getBbbUserIdForParticipant(participant))
      const currUnmuted = unmutedUsers[userId]
        ?? unmutedUsers[getBbbUserIdForParticipant(participant)]
        ?? false;
      const prevUnmuted = debouncedStateRef.current[userId] ?? false;

      if (currUnmuted === prevUnmuted && !debounceTimers.current.has(userId)) return;

      const existingTimer = debounceTimers.current.get(userId);

      // Immediately apply transitions from muted -> unmuted (subscription)
      if (currUnmuted) {
        if (existingTimer) {
          clearTimeout(existingTimer);
          debounceTimers.current.delete(userId);
        }

        setDebouncedState((prev) => {
          if (prev[userId] === true) return prev;

          return { ...prev, [userId]: true };
        });
      } else if (!existingTimer) {
        // Debounce transitions from unmuted -> muted (unsubscription).
        // Only set a timer if one isn't already pending.
        const timer = setTimeout(() => {
          setDebouncedState((prev) => {
            if (prev[userId] === false || !(userId in prev)) return prev;
            return { ...prev, [userId]: false };
          });
          debounceTimers.current.delete(userId);
        }, debounceMs);
        debounceTimers.current.set(userId, timer);
      }
    });
  }, [participants, unmutedUsers]);

  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(clearTimeout);
      debounceTimers.current.clear();
    };
  }, []);

  return debouncedState;
};

export const useMediaSenders = (
  remoteParticipants: RemoteParticipant[],
  deafened: boolean,
  mediaType: MediaType,
): MediaSendersData => {
  const { data, errors } = useMediaGroupStreamsSubscription();

  if (errors) {
    errors.forEach((error) => {
      logger.error({
        logCode: 'livekit_audio_sel_group_sub_error',
        extraInfo: {
          errorMessage: error.message,
          mediaType,
        },
      }, `LiveKit: ${mediaType} group streams subscription failed.`);
    });
  }

  return useMemo<MediaSendersData>(() => {
    if (deafened && mediaType === MediaType.AUDIO) return { senders: [], inAnyGroup: false };

    const groups = (data as MediaGroupStream[] || []).filter(
      (group) => group.mediaType === mediaType,
    );
    // Groups where I am a receiver - I see the union of senders from all of these
    const myInboundGroupIds = groups.filter(
      (group) => group.userId === Auth.userID && group.receiver === true,
    ).map((group) => group.groupId);
    const inAnyGroup = myInboundGroupIds.length > 0;

    // No explicit group membership = treat as public receiver.
    // Public receivers receive from: groupless senders + public group senders.
    // Exclude only senders in non-public groups.
    if (!inAnyGroup) {
      const senderIdsInNonPublicGroups = new Set(groups
        .filter((group) => group.sender === true && group.active && group.groupId !== PUBLIC_GROUP_IDS[mediaType])
        .map((group) => group.userId));
      const senderIdsInPublicGroup = new Set(groups
        .filter((g) => g.sender === true && g.active && g.groupId === PUBLIC_GROUP_IDS[mediaType])
        .map((g) => g.userId));
      // Exclude only senders who are active in non-public groups but NOT in the public group.
      // Users concurrently sending in both public and non-public groups should still be
      // heard by public receivers.
      const senderIdsOnlyInNonPublic = new Set(
        [...senderIdsInNonPublicGroups].filter((id) => !senderIdsInPublicGroup.has(id)),
      );
      // Media groups use BBB intIds, which differ from LiveKit participant.identity
      // for dial-in/VO participants (see getBbbUserIdForParticipant).
      // Map pID to BBB intId when comparing against the non-public-sender set,
      // but keep senders keyed by participant.identity so downstream code that
      // looks up participants in the LiveKit room still matches.
      const senders = remoteParticipants
        .filter((participant) => !senderIdsOnlyInNonPublic.has(getBbbUserIdForParticipant(participant)))
        .map((participant) => ({
          userId: participant.identity,
          groupId: 'default',
          mediaType,
          sender: true,
          receiver: true,
          active: true,
        }));

      return { senders, inAnyGroup: false };
    }

    // Union of senders from all groups where I am a receiver.
    // Dedupe by userId (first occurrence wins) and rewrite BBB intId to LK
    // identity as they are not 1:1 compatible for dial-in/VO users (see getBbbUserIdForParticipant).
    const bbbIdToIdentity = new Map<string, string>();
    remoteParticipants.forEach((p) => {
      bbbIdToIdentity.set(getBbbUserIdForParticipant(p), p.identity);
    });
    const myInboundGroupSet = new Set(myInboundGroupIds);
    const seenUserIds = new Set<string>();
    const senders = groups.reduce<MediaGroupStream[]>((acc, stream) => {
      if (!myInboundGroupSet.has(stream.groupId)) return acc;

      if (!stream.sender || !stream.active) return acc;

      if (seenUserIds.has(stream.userId)) return acc;

      const identity = bbbIdToIdentity.get(stream.userId);

      if (!identity) return acc;

      seenUserIds.add(stream.userId);
      acc.push({ ...stream, userId: identity });

      return acc;
    }, []);

    return { senders, inAnyGroup };
  }, [data, remoteParticipants, deafened, mediaType]);
};

export const useMediaSubscriptions = (liveKitRoom: Room) => {
  const [autoplayState] = useAutoplayState(liveKitRoom);
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const willinglyDeafened = useReactiveVar(AudioManager._isDeafened.value) as boolean;
  const deafened = willinglyDeafened || !autoplayState.canPlayAudio;
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: PARTICIPANTS_UPDATE_FILTER,
  });
  // Audio group-based filtering; screen share audio is handled separately
  // (always subscribed regardless of groups) in handleSubscriptionChanges.
  const { senders, inAnyGroup } = useMediaSenders(remoteParticipants, deafened, MediaType.AUDIO);
  const { audioSubscriptionPoolSize, muteDebounceMs } = getSelectiveSubscriptionConfig();
  const participantsLastSpokeAt = useParticipantsLastSpokeAt(liveKitRoom);
  const debouncedUnmutedUsers = useDebouncedMuteState(
    remoteParticipants,
    muteDebounceMs,
  );

  const handleSubscriptionChanges = useCallback(async () => {
    if (!liveKitRoom) return;

    const currentSubscriptions: Record<Track.Source.Microphone | Track.Source.ScreenShareAudio, Set<string>> = {
      [Track.Source.Microphone]: new Set<string>(),
      [Track.Source.ScreenShareAudio]: new Set<string>(),
    };
    // Collect unsubscribed screen share audio publications upfront so we can
    // forcefully subscribe them.
    const pendingScreenShareAudio: Array<{
      publication: RemoteTrackPublication;
      participantId: string;
    }> = [];
    const participantsById = new Map<string, RemoteParticipant>();

    remoteParticipants.forEach((participant) => {
      participantsById.set(participant.identity, participant);
      participant.audioTrackPublications.forEach((publication: RemoteTrackPublication) => {
        if (isAudioSource(publication.source)) {
          if (publication.isSubscribed) {
            const source = publication.source as Track.Source.Microphone | Track.Source.ScreenShareAudio;
            currentSubscriptions[source].add(participant.identity);
          } else if (publication.source === Track.Source.ScreenShareAudio) {
            pendingScreenShareAudio.push({
              publication,
              participantId: participant.identity,
            });
          }
        }
      });
    });

    // List of potential senders prior to any Last N filtering
    const availableSenderIds = new Set(senders.map((sender) => sender.userId));
    const availableParticipants = remoteParticipants
      .filter((participant) => availableSenderIds.has(participant.identity));

    // By default, subscribe to all available senders as defined by the useMediaSenders hook
    let desiredSubscriptions: Set<string> = availableSenderIds;

    // Last N filtering is active, restrict subscriptions
    if (audioSubscriptionPoolSize > 0) {
      desiredSubscriptions = selectParticipantsToSubscribe(
        availableParticipants,
        participantsLastSpokeAt,
        debouncedUnmutedUsers,
        audioSubscriptionPoolSize,
      );
    }

    // Handle new subscriptions
    desiredSubscriptions.forEach((participantId) => {
      Object.entries(currentSubscriptions).forEach(([source, subscriptions]) => {
        if (!subscriptions.has(participantId)) {
          const participant = participantsById.get(participantId);
          if (participant) {
            participant.audioTrackPublications.forEach((publication) => {
              const { trackSid } = publication;

              if (!publication.isSubscribed && publication.source === source) {
                publication.setSubscribed(true);
                logger.debug({
                  logCode: 'livekit_audio_sel_subscribed',
                  extraInfo: {
                    trackSid,
                    participantId,
                    inAnyGroup,
                    source: publication.source,
                  },
                }, `LiveKit: Subscribed to ${publication.source} - ${trackSid}`);
              }
            });
          }
        }
      });
    });

    Object.values(currentSubscriptions).forEach((subscriptions) => {
      subscriptions.forEach((participantId) => {
        if (!desiredSubscriptions.has(participantId)) {
          const participant = participantsById.get(participantId);
          if (participant) {
            participant.audioTrackPublications.forEach((publication) => {
              // Screen share audio is always subscribed regardless of group membership
              if (publication.source === Track.Source.ScreenShareAudio) return;

              const { trackSid } = publication;

              if (publication.isSubscribed) {
                publication.setSubscribed(false);
                logger.debug({
                  logCode: 'livekit_audio_sel_unsubscribed',
                  extraInfo: {
                    userId: participantId,
                    inAnyGroup,
                    source: publication.source,
                  },
                }, `LiveKit: Unsubscribed from ${publication.source} - ${trackSid}`);
              }
            });
          }
        }
      });
    });

    // Force-subscribe any screen share audio not already handled by the
    // desired-subscription pass above.
    pendingScreenShareAudio.forEach(({ publication, participantId }) => {
      if (!publication.isSubscribed && !desiredSubscriptions.has(participantId)) {
        publication.setSubscribed(true);
        logger.debug({
          logCode: 'livekit_audio_sel_subscribed',
          extraInfo: {
            trackSid: publication.trackSid,
            participantId,
            source: publication.source,
          },
        }, `LiveKit: Subscribed to ${publication.source} - ${publication.trackSid} (always-on)`);
      }
    });
  }, [
    senders,
    inAnyGroup,
    remoteParticipants,
    deafened,
    participantsLastSpokeAt,
    debouncedUnmutedUsers,
  ]);

  return {
    handleSubscriptionChanges,
  };
};
