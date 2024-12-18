import { useEffect, useRef, useState } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/whoIsTalking';
import { partition } from '/imports/utils/array-utils';

type VoiceItem = VoiceActivityResponse['user_voice_activity_stream'][number];

const TALKING_INDICATOR_TIMEOUT = 6000;

const createUseTalkingUsers = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<VoiceActivityResponse['user_voice_activity_stream'] | undefined>([]);
  const loadingVar = makeVar(true);

  const dispatchTalkingUserUpdate = (data?: VoiceActivityResponse['user_voice_activity_stream']) => stateVar(data);

  const setTalkingUserLoading = (loading: boolean) => loadingVar(loading);

  const useTalkingUserConsumersCount = () => useReactiveVar(countVar);

  const useTalkingUsers = () => {
    const voiceActivity = useReactiveVar(stateVar);
    const loading = useReactiveVar(loadingVar);
    const mutedTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
    const spokeTimeoutRegistry = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
    const [record, setRecord] = useState<Record<string, VoiceItem>>({});

    useEffect(() => {
      countVar(countVar() + 1);
      return () => {
        countVar(countVar() - 1);
      };
    }, []);

    useEffect(() => {
      if (!voiceActivity) {
        setRecord({});
        return;
      }

      const [muted, unmuted] = partition(
        voiceActivity,
        (v: VoiceItem) => v.muted,
      ) as [VoiceItem[], VoiceItem[]];

      unmuted.forEach((voice) => {
        const {
          endTime, startTime, talking, userId,
        } = voice;
        const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
        const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

        // User has never talked
        if (!(endTime || startTime)) return;

        setRecord((previousRecord) => {
          const previousIndicator = previousRecord[userId];

          if (!previousIndicator && !talking) {
            return previousRecord;
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
        const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
        const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

        // User has never talked or exited audio
        if (!(endTime || startTime)) {
          setRecord((previousRecord) => {
            const newRecord = { ...previousRecord };
            delete newRecord[userId];
            return newRecord;
          });
          return;
        }

        setRecord((previousRecord) => {
          const previousIndicator = previousRecord[userId];

          if (!previousIndicator) {
            return previousRecord;
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
      error: undefined,
      loading,
      data: record,
    };
  };

  return [
    useTalkingUsers,
    useTalkingUserConsumersCount,
    dispatchTalkingUserUpdate,
    setTalkingUserLoading,
  ] as const;
};

const [
  useTalkingUsers,
  useTalkingUserConsumersCount,
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
] = createUseTalkingUsers();

export {
  useTalkingUserConsumersCount,
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
};

export default useTalkingUsers;
