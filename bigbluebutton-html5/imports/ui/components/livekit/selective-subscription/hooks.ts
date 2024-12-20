import { useCallback, useRef, useState } from 'react';
import {
  type RemoteTrackPublication,
} from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import {
  AUDIO_GROUP_STREAMS_SUBSCRIPTION,
} from '/imports/ui/components/livekit/selective-subscription/queries';
import {
  AudioGroupStream,
  SUBSCRIPTION_RETRY,
  ParticipantTypes,
} from '/imports/ui/components/livekit/selective-subscription/types';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';

const useAudioGroupStreamsSubscription = createUseSubscription(
  AUDIO_GROUP_STREAMS_SUBSCRIPTION,
  {},
  true,
);

export const useAudioGroups = () => {
  const { data, loading, errors } = useAudioGroupStreamsSubscription();

  if (loading) return { groups: [], hasGroups: false };

  if (errors) {
    errors.forEach((error) => {
      logger.error({
        logCode: 'livekit_audio_group_streams_sub_error',
        extraInfo: {
          errorMessage: error.message,
        },
      }, 'LiveKit: Audio group streams subscription failed.');
    });
  }

  if (!data) return { groups: [], hasGroups: false };

  const groups = data as AudioGroupStream[];
  const myGroups = groups.filter((group) => group.userId === Auth.userID);
  const hasGroups = myGroups.length > 0;
  const typeFilter = [
    ParticipantTypes.SENDER,
    ParticipantTypes.SENDRECV,
  ];

  if (!hasGroups) {
    const senderIds = new Set(groups
      .filter((group) => typeFilter.includes(group.participantType))
      .map((group) => group.userId));

    const nonGroupParticipants = Array.from(liveKitRoom.remoteParticipants.values())
      .filter((participant) => !senderIds.has(participant.identity))
      .map((participant) => ({
        userId: participant.identity,
        participantType: ParticipantTypes.SENDRECV,
        active: true,
      }));

    return { groups: nonGroupParticipants, hasGroups: false };
  }

  const senders = groups.filter(
    (stream) => typeFilter.includes(stream.participantType) && stream.active,
  );

  return { groups: senders, hasGroups };
};

interface RetryState {
  attempts: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export const useAudioSubscriptions = () => {
  const { groups, hasGroups } = useAudioGroups();
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
        logCode: 'livekit_audio_subscription_max_retries',
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
          logCode: 'livekit_audio_subscription_retry_success',
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
    // eslint-disable-next-line no-console
    console.log('LiveKit: handleSubscriptionChanges', {
      liveKitRoom,
      groups,
      hasGroups,
    });

    if (!liveKitRoom) return;

    const currentSubscriptions = new Set<string>();
    liveKitRoom.remoteParticipants.forEach((participant) => {
      participant.audioTrackPublications.forEach((publication) => {
        if (publication.isSubscribed) {
          currentSubscriptions.add(participant.identity);
        }
      });
    });

    const desiredSubscriptions = new Set(
      groups.map((sender) => sender.userId),
    );

    currentSubscriptions.forEach((participantId) => {
      if (!desiredSubscriptions.has(participantId)) {
        const participant = liveKitRoom.remoteParticipants.get(participantId);
        if (participant) {
          participant.audioTrackPublications.forEach((publication) => {
            const { trackSid } = publication;
            if (publication.isSubscribed) {
              clearRetryTimer(participantId);
              retryMap.current.delete(participantId);
              try {
                publication.setSubscribed(false);
                logger.debug({
                  logCode: 'livekit_audio_unsubscribed',
                  extraInfo: {
                    userId: participantId,
                    hasGroups,
                  },
                }, `LiveKit: Unsubscribed from audio - ${trackSid}`);
              } catch (error) {
                logger.error({
                  logCode: 'livekit_audio_unsubscription_failed',
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

    // Handle new subscriptions
    desiredSubscriptions.forEach((participantId) => {
      if (!currentSubscriptions.has(participantId)) {
        const participant = liveKitRoom.remoteParticipants.get(participantId);
        if (participant) {
          participant.audioTrackPublications.forEach((publication) => {
            const { trackSid } = publication;

            if (!publication.isSubscribed) {
              try {
                publication.setSubscribed(true);
                logger.debug({
                  logCode: 'livekit_audio_subscribed',
                  extraInfo: {
                    trackSid,
                    hasGroups,
                  },
                }, `LiveKit: Subscribed to audio - ${trackSid}`);
              } catch (error) {
                logger.error({
                  logCode: 'livekit_audio_subscription_failed',
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
  }, [groups, hasGroups, retrySubscription]);

  return {
    handleSubscriptionChanges,
    subscriptionErrors,
  };
};
