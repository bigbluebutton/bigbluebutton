import { useMemo } from 'react';
import useVoiceActivity from './useVoiceActivity';

const useWhoIsUnmuted = () => {
  const {
    data: voiceActivity,
    loading,
  } = useVoiceActivity();

  const record = useMemo(() => {
    const mutedUsers: Set<string> = new Set(Object.keys(voiceActivity));
    return mutedUsers;
  }, [voiceActivity]);

  return {
    data: record,
    loading,
  };
};

export default useWhoIsUnmuted;
