import { useEffect, useState } from 'react';
import useVoiceActivity from './useVoiceActivity';

const useWhoIsUnmuted = () => {
  const {
    data: voiceActivity,
    loading,
  } = useVoiceActivity();
  const [unmutedUsers, setUnmutedUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!voiceActivity) return;

    const newUnmutedUsers = { ...unmutedUsers };

    voiceActivity.forEach((voice) => {
      const { userId, muted } = voice;

      if (muted) {
        delete newUnmutedUsers[userId];
        return;
      }

      newUnmutedUsers[userId] = true;
    });

    setUnmutedUsers(newUnmutedUsers);
  }, [voiceActivity]);

  return {
    data: unmutedUsers,
    loading,
  };
};

export default useWhoIsUnmuted;
