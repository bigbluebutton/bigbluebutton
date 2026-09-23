import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'radash';
import { VoiceUserMetadata } from './types';

export type VoiceItem = {
  startTime?: number;
  endTime?: number;
  muted: boolean;
  talking: boolean;
  userId: string;
  user: VoiceUserMetadata;
};

const TALKING_INDICATOR_TIMEOUT = 6000;

const clearRegistryTimeout = (
  registry: Record<string, ReturnType<typeof setTimeout> | null>,
  userId: string,
) => {
  const timeout = registry[userId];

  if (timeout) {
    clearTimeout(timeout);
    // eslint-disable-next-line no-param-reassign
    registry[userId] = null;
  }
};

const clearRegistryTimeouts = (registry: Record<string, ReturnType<typeof setTimeout> | null>) => {
  Object.keys(registry).forEach((userId) => clearRegistryTimeout(registry, userId));
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
 * @param isSnapshot - Whether each pass carries every user the source knows about. Sources
 *   that emit deltas (the server voice activity stream) must leave this off: there, an absent
 *   user is only one with no news.
 * @returns Processed record of VoiceItem objects keyed by userId
 *
 */
const useTimedTalkingIndicator = (
  rawVoiceActivity: RawVoiceActivityItem[] | undefined,
  enabled: boolean,
  isSnapshot = false,
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

    // Accumulate the whole batch into a single record so that a pass which moves
    // nothing writes no state at all
    setRecord((previousRecord) => {
      const nextRecord: Record<string, VoiceItem> = { ...previousRecord };
      let changed = false;

      rawVoiceActivity.forEach((voiceActivityItem) => {
        const {
          userId, talking, muted, user, voiceUserId,
        } = voiceActivityItem;
        const previousIndicator = nextRecord[userId];
        const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
        const currentMutedTimeout = mutedTimeoutRegistry.current[userId];
        let nextIndicator: VoiceItem;

        // Handle unmuted users
        if (!muted) {
          // Skip if no previous state and not talking
          if (!previousIndicator && !talking) return;

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
            clearRegistryTimeout(spokeTimeoutRegistry.current, userId);
            clearRegistryTimeout(mutedTimeoutRegistry.current, userId);
          }

          // User has stopped talking - schedule removal
          if (endTime && !currentSpokeTimeout) {
            spokeTimeoutRegistry.current[userId] = setTimeout(() => {
              setRecord((prevRecord) => {
                if (!(userId in prevRecord)) return prevRecord;

                const newRecord = { ...prevRecord };
                delete newRecord[userId];
                return newRecord;
              });
              spokeTimeoutRegistry.current[userId] = null;
            }, TALKING_INDICATOR_TIMEOUT);
          }

          nextIndicator = {
            ...(previousIndicator || {}),
            userId,
            muted,
            talking,
            startTime,
            endTime,
            user,
          };
        } else {
          // Handle muted users
          // If no previous state, leave the record untouched (muted)
          if (!previousIndicator) return;

          const { startTime } = previousIndicator;
          const endTime = previousIndicator.talking
            ? Date.now()
            : previousIndicator.endTime;

          // User has never talked or exited audio
          // voiceUserId check is for GraphQL compatibility - when user exits audio,
          // voiceUserId becomes empty
          if (!(endTime || startTime) || (voiceUserId !== undefined && !voiceUserId)) {
            clearRegistryTimeout(spokeTimeoutRegistry.current, userId);
            clearRegistryTimeout(mutedTimeoutRegistry.current, userId);
            delete nextRecord[userId];
            changed = true;

            return;
          }

          // Schedule removal if necessary (muted)
          if (!currentMutedTimeout && !currentSpokeTimeout) {
            mutedTimeoutRegistry.current[userId] = setTimeout(() => {
              setRecord((prevRecord) => {
                if (!(userId in prevRecord)) return prevRecord;

                const newRecord = { ...prevRecord };
                delete newRecord[userId];
                return newRecord;
              });
              mutedTimeoutRegistry.current[userId] = null;
            }, TALKING_INDICATOR_TIMEOUT);
          }

          nextIndicator = {
            ...previousIndicator,
            userId,
            muted,
            talking: false,
            startTime,
            endTime,
            user,
          };
        }

        if (isEqual(previousIndicator, nextIndicator)) return;

        nextRecord[userId] = nextIndicator;
        changed = true;
      });

      // A user missing from a snapshot has left audio for good, and nothing else can
      // retire their entry: removal is only ever scheduled off a pass that carries them,
      // so one that vanishes mid-talk keeps talking = true forever.
      if (isSnapshot) {
        const reported = new Set(rawVoiceActivity.map((voiceActivityItem) => voiceActivityItem.userId));

        Object.keys(nextRecord).forEach((userId) => {
          if (reported.has(userId)) return;

          clearRegistryTimeout(spokeTimeoutRegistry.current, userId);
          clearRegistryTimeout(mutedTimeoutRegistry.current, userId);
          delete nextRecord[userId];
          changed = true;
        });
      }

      return changed ? nextRecord : previousRecord;
    });
  }, [rawVoiceActivity, enabled, isSnapshot]);

  useEffect(() => {
    return () => {
      clearRegistryTimeouts(spokeTimeoutRegistry.current);
      clearRegistryTimeouts(mutedTimeoutRegistry.current);
    };
  }, []);

  return record;
};

export default useTimedTalkingIndicator;
