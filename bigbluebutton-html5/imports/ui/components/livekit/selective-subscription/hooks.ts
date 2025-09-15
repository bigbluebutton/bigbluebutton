import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  RoomEvent,
  RemoteParticipant,
  Track,
  type RemoteTrackPublication,
} from 'livekit-client';
import { useReactiveVar } from '@apollo/client';
import { useRemoteParticipants } from '@livekit/components-react';
import { liveKitRoom } from '/imports/ui/services/livekit';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import {
  AUDIO_GROUP_STREAMS_SUBSCRIPTION,
} from '/imports/ui/components/livekit/selective-subscription/queries';
import {
  AudioGroupStream,
  AudioSendersData,
  SUBSCRIPTION_RETRY,
  ParticipantTypes,
} from '/imports/ui/components/livekit/selective-subscription/types';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';
import AudioManager from '/imports/ui/services/audio-manager';
import { useAutoplayState } from '/imports/ui/components/livekit/autoplay-modal/hooks';

const useAudioGroupStreamsSubscription = createUseSubscription(
  AUDIO_GROUP_STREAMS_SUBSCRIPTION,
  {},
  true,
);

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
];

const isValidSource = (source: Track.Source) => (
  source === Track.Source.Microphone || source === Track.Source.ScreenShareAudio
);

export const useAudioSenders = (
  remoteParticipants: RemoteParticipant[],
  deafened: boolean,
): AudioSendersData => {
  const { data, errors } = useAudioGroupStreamsSubscription();

  if (errors) {
    errors.forEach((error) => {
      logger.error({
        logCode: 'livekit_audio_sel_group_sub_error',
        extraInfo: {
          errorMessage: error.message,
        },
      }, 'LiveKit: Audio group streams subscription failed.');
    });
  }

  if (deafened) return { senders: [], inAnyGroup: false };

  const groups = data as AudioGroupStream[] || [];
  const receiverFilter = [
    ParticipantTypes.RECEIVER,
    ParticipantTypes.SENDRECV,
  ];
  const myInboundGroupIds = groups.filter(
    (group) => group.userId === Auth.userID && receiverFilter.includes(group.participantType),
  ).map((group) => group.groupId);
  const inAnyGroup = myInboundGroupIds.length > 0;
  const senderFilter = [
    ParticipantTypes.SENDER,
    ParticipantTypes.SENDRECV,
  ];

  // If we don't have any groups, we need to subscribe to all senders that
  // are not part of a sender group
  if (!inAnyGroup) {
    const senderIds = new Set(groups
      .filter((group) => senderFilter.includes(group.participantType))
      .map((group) => group.userId));

    const grouplessSenders = remoteParticipants
      .filter((participant) => !senderIds.has(participant.identity))
      .map((participant) => ({
        userId: participant.identity,
        groupId: 'default',
        participantType: ParticipantTypes.SENDRECV,
        active: true,
      }));

    return { senders: grouplessSenders, inAnyGroup: false };
  }

  const senders = groups
    .filter((group) => myInboundGroupIds.includes(group.groupId))
    .filter((stream) => senderFilter.includes(stream.participantType) && stream.active);

  return { senders, inAnyGroup };
};

interface RetryState {
  attempts: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export const useAudioSubscriptions = () => {
  const [autoplayState] = useAutoplayState(liveKitRoom);
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const willinglyDeafened = useReactiveVar(AudioManager._isDeafened.value) as boolean;
  const deafened = willinglyDeafened || !autoplayState.canPlayAudio;
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: PARTICIPANTS_UPDATE_FILTER,
  });
  const { senders, inAnyGroup } = useAudioSenders(remoteParticipants, deafened);
  const retryMap = useRef<Map<string, RetryState>>(new Map());
  const [subscriptionErrors, setSubscriptionErrors] = useState<Map<string, Error>>(new Map());

  const clearRetryTimer = (userId: string) => {
    const state = retryMap.current.get(userId);
    if (state?.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  };

  const retrySubscription = useCallback((userId: string, publication: RemoteTrackPublication) => {
    const { trackSid } = publication;
    const state = retryMap.current.get(userId) || { attempts: 0, timer: null };
    const { attempts } = state;

    if (attempts >= SUBSCRIPTION_RETRY.MAX_RETRIES) {
      logger.error({
        logCode: 'livekit_audio_sel_subscription_max_retries',
        extraInfo: {
          trackSid,
        },
      }, `LiveKit: audio maxed retries - ${trackSid}`);
      retryMap.current.delete(userId);
      return;
    }

    const delay = SUBSCRIPTION_RETRY.RETRY_INTERVAL
      ** (SUBSCRIPTION_RETRY.BACKOFF_MULTIPLIER, attempts);

    clearRetryTimer(userId);

    state.timer = setTimeout(async () => {
      try {
        publication.setSubscribed(true);
        logger.info({
          logCode: 'livekit_audio_sel_subscription_retry_success',
          extraInfo: { userId, attempts: attempts + 1 },
        }, `Successfully subscribed to ${userId} after ${attempts + 1} attempts`);
        retryMap.current.delete(userId);
        setSubscriptionErrors((prev) => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      } catch (error) {
        state.attempts += 1;
        retryMap.current.set(userId, state);
        setSubscriptionErrors((prev) => {
          const next = new Map(prev);
          next.set(userId, error as Error);
          return next;
        });
        retrySubscription(userId, publication);
      }
    }, delay);

    retryMap.current.set(userId, state);
  }, []);

  const handleSubscriptionChanges = useCallback(async () => {
    if (!liveKitRoom) return;

    const currentSubscriptions = {
      [Track.Source.Microphone]: new Set<string>(),
      [Track.Source.ScreenShareAudio]: new Set<string>(),
    };

    remoteParticipants.forEach((participant) => {
      participant.audioTrackPublications.forEach((publication: RemoteTrackPublication) => {
        if (isValidSource(publication.source) && publication.isSubscribed) {
          currentSubscriptions[publication.source].add(participant.identity);
        }
      });
    });

    const desiredSubscriptions = new Set(
      senders.map((sender) => sender.userId),
    );

    Object.values(currentSubscriptions).forEach((subscriptions) => {
      subscriptions.forEach((participantId) => {
        if (!desiredSubscriptions.has(participantId)) {
          const participant = remoteParticipants.find((p) => p.identity === participantId);
          if (participant) {
            participant.audioTrackPublications.forEach((publication) => {
              const { trackSid } = publication;

              if (publication.isSubscribed) {
                clearRetryTimer(participantId);
                retryMap.current.delete(participantId);
                try {
                  publication.setSubscribed(false);
                  logger.debug({
                    logCode: 'livekit_audio_sel_unsubscribed',
                    extraInfo: {
                      userId: participantId,
                      inAnyGroup,
                    },
                  }, `LiveKit: Unsubscribed from audio - ${trackSid}`);
                } catch (error) {
                  logger.error({
                    logCode: 'livekit_audio_sel_unsubscription_failed',
                    extraInfo: {
                      trackSid,
                      errorMessage: (error as Error).message,
                      errorStack: (error as Error).stack,
                    },
                  }, `LiveKit: Failed to unsubscribe from audio - ${trackSid}`);
                }
              }
            });
          }
        }
      });
    });

    // Handle new subscriptions
    desiredSubscriptions.forEach((participantId) => {
      Object.entries(currentSubscriptions).forEach(([source, subscriptions]) => {
        if (!subscriptions.has(participantId)) {
          const participant = remoteParticipants.find((p) => p.identity === participantId);
          if (participant) {
            participant.audioTrackPublications.forEach((publication) => {
              const { trackSid } = publication;

              if (!publication.isSubscribed && publication.source === source) {
                try {
                  publication.setSubscribed(true);
                  logger.debug({
                    logCode: 'livekit_audio_sel_subscribed',
                    extraInfo: {
                      trackSid,
                      inAnyGroup,
                    },
                  }, `LiveKit: Subscribed to audio - ${trackSid}`);
                } catch (error) {
                  logger.error({
                    logCode: 'livekit_audio_sel_subscription_failed',
                    extraInfo: {
                      trackSid,
                      errorMessage: (error as Error).message,
                      errorStack: (error as Error).stack,
                    },
                  }, `LiveKit: Failed to subscribe to audio - ${trackSid}`);

                  setSubscriptionErrors((prev) => {
                    const next = new Map(prev);
                    next.set(participantId, error as Error);
                    return next;
                  });

                  retrySubscription(participantId, publication);
                }
              }
            });
          }
        }
      });
    });
  }, [
    senders,
    inAnyGroup,
    retrySubscription,
    remoteParticipants,
    deafened,
  ]);

  return {
    handleSubscriptionChanges,
    subscriptionErrors,
  };
};
