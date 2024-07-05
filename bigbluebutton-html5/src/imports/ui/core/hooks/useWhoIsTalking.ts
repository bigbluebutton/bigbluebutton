import { useEffect, useState } from 'react';
import useVoiceActivity from './useVoiceActivity';

const useWhoIsTalking = () => {
  const {
    data: voiceActivity,
    loading,
  } = useVoiceActivity();
  const [talkingUsers, setTalkingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!voiceActivity) return;

    const newTalkingUsers: Record<string, boolean> = { ...talkingUsers };

    voiceActivity.forEach(({ userId, muted, talking }) => {
      if (muted) {
        delete newTalkingUsers[userId];
        return;
      }

      newTalkingUsers[userId] = talking;
    });

    setTalkingUsers(newTalkingUsers);
  }, [voiceActivity]);

  return {
    data: talkingUsers,
    loading,
  };
};

export default useWhoIsTalking;
