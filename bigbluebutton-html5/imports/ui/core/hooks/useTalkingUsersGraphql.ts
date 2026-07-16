import { useEffect, useRef, useState } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import { partition } from '/imports/utils/array-utils';
import { VoiceItem, VoiceUserMetadata } from './types';
import { TALKING_INDICATOR_TIMEOUT } from './constants';
import { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/voiceActivity';

const createUseTalkingUsersGraphql = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<{
    muted: boolean;
    talking: boolean;
    userId: string;
    voiceUserId: string;
    user: VoiceUserMetadata;
  }[] | undefined>([]);
  const loadingVar = makeVar(true);

  const dispatchTalkingUserUpdate = (data?: VoiceActivityResponse['user_voice_activity_stream']) => stateVar(data);

  const setTalkingUserLoading = (loading: boolean) => loadingVar(loading);

  const useTalkingUserConsumersCount = () => useReactiveVar(countVar);

  const useTalkingUsersGraphql = () => {
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
        (v) => v.muted,
      );

      unmuted.forEach((voice) => {
        const {
          talking, userId, muted, user,
        } = voice;
        const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
        const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

        setRecord((previousRecord) => {
          const previousIndicator = previousRecord[userId];

          if (!previousIndicator && !talking) {
            return previousRecord;
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

          return {
            ...previousRecord,
            [userId]: Object.assign(
              previousRecord[userId] || {},
              {
                userId,
                muted,
                talking,
                startTime,
                endTime,
                user,
              },
            ),
          };
        });
      });

      muted.forEach((voice) => {
        const { userId, voiceUserId, user } = voice;
        const currentSpokeTimeout = spokeTimeoutRegistry.current[userId];
        const currentMutedTimeout = mutedTimeoutRegistry.current[userId];

        setRecord((previousRecord) => {
          const previousIndicator = previousRecord[userId];

          if (!previousIndicator) {
            return previousRecord;
          }

          const { startTime } = previousIndicator;

          const endTime = previousIndicator.talking
            ? Date.now()
            : previousIndicator.endTime;

          // User has never talked or exited audio
          if (!(endTime || startTime) || !voiceUserId) {
            const newRecord = { ...previousRecord };
            delete newRecord[userId];
            return newRecord;
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
              {
                userId,
                muted,
                talking: false,
                startTime,
                endTime,
                user,
              },
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
    useTalkingUsersGraphql,
    useTalkingUserConsumersCount,
    dispatchTalkingUserUpdate,
    setTalkingUserLoading,
  ] as const;
};

const [
  useTalkingUsersGraphql,
  useTalkingUserConsumersCount,
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
] = createUseTalkingUsersGraphql();

export {
  useTalkingUserConsumersCount,
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
};

export default useTalkingUsersGraphql;
