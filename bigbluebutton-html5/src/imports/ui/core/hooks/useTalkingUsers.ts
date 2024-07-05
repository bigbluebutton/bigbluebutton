import { useEffect, useRef, useState } from 'react';
import { VoiceActivityResponse } from 'imports/ui/core/graphql/queries/whoIsTalking';
import { partition } from 'imports/utils/array-utils';
import useVoiceActivity from './useVoiceActivity';

type VoiceItem = VoiceActivityResponse['user_voice_activity_stream'][number] & {
  showTalkingIndicator: boolean | undefined;
};

const TALKING_INDICATOR_TIMEOUT = 5000;

const useTalkingUsers = () => {
  const {
    data: voiceActivity,
    loading,
    error,
  } = useVoiceActivity();
  const [record, setRecord] = useState<Record<string, VoiceItem>>({});
  const mutedTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const spokeTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  useEffect(() => {
    if (!voiceActivity) return;

    const [muted, unmuted] = partition(
      voiceActivity,
      (v: VoiceItem) => v.muted,
    ) as [VoiceItem[], VoiceItem[]];

    unmuted.forEach((voice) => {
      const { endTime, startTime, userId } = voice;
      const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
      const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

      // User has never talked
      if (!(endTime || startTime)) return;

      // Cancel any deletion
      if (currentSpokeTimeout) {
        clearTimeout(currentSpokeTimeout);
        spokeTimeoutRegistry.current[userId] = null;
      }
      if (currentMutedTimeout) {
        clearTimeout(currentMutedTimeout);
        mutedTimeoutRegistry.current[userId] = null;
      }

      setRecord((previousRecord) => {
        // User has stopped talking
        if (endTime) {
          spokeTimeoutRegistry.current[userId] = setTimeout(() => {
            setRecord((previousRecord) => {
              const newRecord = { ...previousRecord };
              delete newRecord[userId];
              return newRecord;
            });
          }, TALKING_INDICATOR_TIMEOUT);
        }

        return {
          ...previousRecord,
          [userId]: Object.assign(
            previousRecord[userId] || {},
            voice,
          ),
        };
      });
    });

    muted.forEach((voice) => {
      const { userId, endTime, startTime } = voice;
      const currentTimeout = mutedTimeoutRegistry.current[userId];

      if (currentTimeout) return;

      // User has never talked
      if (!(endTime || startTime)) return;

      setRecord((previousRecord) => {
        mutedTimeoutRegistry.current[userId] = setTimeout(() => {
          setRecord((previousRecord) => {
            const newRecord = { ...previousRecord };
            delete newRecord[userId];
            return newRecord;
          });
          mutedTimeoutRegistry.current[userId] = null;
        }, TALKING_INDICATOR_TIMEOUT);

        return {
          ...previousRecord,
          [userId]: Object.assign(
            previousRecord[userId] || {},
            voice,
          ),
        };
      });
    });
  }, [voiceActivity]);

  return {
    error,
    loading,
    data: record,
  };
};

export default useTalkingUsers;
