import { useEffect, useState } from 'react';
import useVoiceActivity from './useVoiceActivity';

const useWhoIsTalking = () => {
  const {
    data: voiceActivity,
    loading,
  } = useVoiceActivity();
  const [record, setRecord] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const talkingUsers: Record<string, boolean> = {};

    Object.keys(voiceActivity).forEach((userId) => {
      talkingUsers[userId] = voiceActivity[userId]?.talking;
    });

    setRecord(talkingUsers);
  }, [voiceActivity]);

  return {
    data: record,
    loading,
  };
};

export default useWhoIsTalking;
