import { useEffect, useRef, useState } from 'react';
import { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/whoIsTalking';
import useVoiceActivity from './useVoiceActivity';
import { partition } from '/imports/utils/array-utils';

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
  const timeoutRegistry = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const talkingUsers: Record<string, VoiceItem> = {};
    const [deleted] = partition(
      Object.values(record),
      (v: VoiceItem) => !voiceActivity[v.userId],
    ) as [VoiceItem[], VoiceItem[]];

    Object.values(voiceActivity).forEach((voice) => {
      const { endTime, userId } = voice;

      talkingUsers[userId] = Object.assign(
        talkingUsers[userId] || {},
        voice,
      );

      if (timeoutRegistry.current[userId]) {
        clearTimeout(timeoutRegistry.current[userId]);
      }

      if (endTime) {
        timeoutRegistry.current[userId] = setTimeout(() => {
          setRecord((prevRecord) => {
            const newRecord = { ...prevRecord };
            delete newRecord[userId];
            return newRecord;
          });
        }, TALKING_INDICATOR_TIMEOUT);
      }
    });

    deleted.forEach((voice) => {
      const { userId } = voice;
      const patchedVoice = voice;
      patchedVoice.muted = true;
      patchedVoice.talking = false;
      timeoutRegistry.current[userId] = setTimeout(() => {
        setRecord((prevRecord) => {
          const newRecord = { ...prevRecord };
          delete newRecord[userId];
          return newRecord;
        });
      }, TALKING_INDICATOR_TIMEOUT);
      talkingUsers[userId] = patchedVoice;
    });

    setRecord(talkingUsers);
  }, [voiceActivity]);

  return {
    error,
    loading,
    data: record,
  };
};

export default useTalkingUsers;
