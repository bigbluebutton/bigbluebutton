import { useEffect } from 'react';
import useVoiceActivity from '/imports/ui/core/hooks/useVoiceActivity';
import {
  setWhoIsUnmutedLoading,
  useWhoIsUnmutedConsumersCount,
  dispatchWhoIsUnmutedUpdate,
} from '/imports/ui/core/hooks/useWhoIsUnmuted';
import {
  setWhoIsTalkingLoading,
  useWhoIsTalkingConsumersCount,
  dispatchWhoIsTalkingUpdate,
} from '/imports/ui/core/hooks/useWhoIsTalking';
import {
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
  useTalkingUserConsumersCount,
} from '/imports/ui/core/hooks/useTalkingUsers';

const VoiceActivityAdapter = () => {
  const whoIsUnmutedConsumersCount = useWhoIsUnmutedConsumersCount();
  const whoIsTalkingConsumersCount = useWhoIsTalkingConsumersCount();
  const talkingUserConsumersCount = useTalkingUserConsumersCount();
  const skip = !(
    whoIsUnmutedConsumersCount
    + whoIsTalkingConsumersCount
    + talkingUserConsumersCount > 0
  );
  const { data: voiceActivity, loading } = useVoiceActivity(skip);

  useEffect(() => {
    dispatchWhoIsUnmutedUpdate(voiceActivity);
    dispatchWhoIsTalkingUpdate(voiceActivity);
    dispatchTalkingUserUpdate(voiceActivity);
  }, [voiceActivity]);

  useEffect(() => {
    setWhoIsUnmutedLoading(loading);
    setWhoIsTalkingLoading(loading);
    setTalkingUserLoading(loading);
  }, [loading]);

  return null;
};

export default VoiceActivityAdapter;
