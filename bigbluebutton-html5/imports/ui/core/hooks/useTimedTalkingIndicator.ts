import { useEffect, useRef, useState } from 'react';
import { VoiceItem, VoiceUserMetadata } from './types';

const TALKING_INDICATOR_TIMEOUT = 6000;

const clearRegistryTimeouts = (registry: Record<string, ReturnType<typeof setTimeout> | null>) => {
  Object.keys(registry).forEach((userId) => {
    const timeout = registry[userId];

    if (timeout) {
      clearTimeout(timeout);
      // eslint-disable-next-line no-param-reassign
      registry[userId] = null;
    }
  });
};

export type RawVoiceActivityItem = {
  userId: string;
  talking: boolean;
  muted: boolean;
  user: VoiceUserMetadata;
  voiceUserId?: string;
};

/**
 * Hook that processes raw voice activity data and applies timing logic for
 * the talking indicator state.
 *
 * @param rawVoiceActivity - Array of raw voice activity items from the data source
 * @param enabled - Whether the hook should process data (set to false when loading or disabled)
 * @returns Processed record of VoiceItem objects keyed by userId
 *
 */
const useTimedTalkingIndicator = (
  rawVoiceActivity: RawVoiceActivityItem[] | undefined,
  enabled: boolean,
): Record<string, VoiceItem> => {
  const mutedTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const spokeTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const [record, setRecord] = useState<Record<string, VoiceItem>>({});

  useEffect(() => {
    // Disabled/no data - clear state and skip
    if (!enabled || !rawVoiceActivity) {
      clearRegistryTimeouts(spokeTimeoutRegistry.current);
      clearRegistryTimeouts(mutedTimeoutRegistry.current);

      if (Object.keys(record).length > 0) setRecord({});

      return;
    }

    rawVoiceActivity.forEach((voiceActivityItem) => {
      const {
        userId, talking, muted, user, voiceUserId,
      } = voiceActivityItem;
      const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
      const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

      setRecord((previousRecord) => {
        const previousIndicator = previousRecord[userId];

        // Handle unmuted users
        if (!muted) {
          // Skip if no previous state and not talking
          if (!previousIndicator && !talking) return previousRecord;

          let startTime = previousIndicator?.startTime ?? 0;
          let endTime = previousIndicator?.endTime ?? 0;

          // User stopped talking
          if (previousIndicator?.talking && !talking) {
            endTime = Date.now();
            startTime = 0;
          }

          // User started talking
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

          // User has stopped talking - schedule removal
          if (endTime && !currentSpokeTimeout) {
            spokeTimeoutRegistry.current[userId] = setTimeout(() => {
              setRecord((prevRecord) => {
                const newRecord = { ...prevRecord };
                delete newRecord[userId];
                return newRecord;
              });
              spokeTimeoutRegistry.current[userId] = null;
            }, TALKING_INDICATOR_TIMEOUT);
          }

          return {
            ...previousRecord,
            [userId]: {
              ...(previousIndicator || {}),
              userId,
              muted,
              talking,
              startTime,
              endTime,
              user,
            },
          };
        }

        // Else: Handle muted users
        // If no previous state, return previous record (muted)
        if (!previousIndicator) return previousRecord;

        const { startTime } = previousIndicator;
        const endTime = previousIndicator.talking
          ? Date.now()
          : previousIndicator.endTime;

        // User has never talked or exited audio
        // voiceUserId check is for GraphQL compatibility - when user exits audio,
        // voiceUserId becomes empty
        if (!(endTime || startTime) || (voiceUserId !== undefined && !voiceUserId)) {
          const newRecord = { ...previousRecord };
          delete newRecord[userId];
          return newRecord;
        }

        // Schedule removal if necessary (muted)
        if (!currentMutedTimeout && !currentSpokeTimeout) {
          mutedTimeoutRegistry.current[userId] = setTimeout(() => {
            setRecord((prevRecord) => {
              const newRecord = { ...prevRecord };
              delete newRecord[userId];
              return newRecord;
            });
            mutedTimeoutRegistry.current[userId] = null;
          }, TALKING_INDICATOR_TIMEOUT);
        }

        return {
          ...previousRecord,
          [userId]: {
            ...previousIndicator,
            userId,
            muted,
            talking: false,
            startTime,
            endTime,
            user,
          },
        };
      });
    });
  }, [rawVoiceActivity, enabled]);

  useEffect(() => {
    return () => {
      clearRegistryTimeouts(spokeTimeoutRegistry.current);
      clearRegistryTimeouts(mutedTimeoutRegistry.current);
    };
  }, []);

  return record;
};

export default useTimedTalkingIndicator;
