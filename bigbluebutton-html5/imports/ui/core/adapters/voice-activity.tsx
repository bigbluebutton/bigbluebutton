import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
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
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import useUserMutedState from '/imports/ui/core/hooks/useUserMutedState';

const VoiceActivityAdapter = () => {
  const whoIsUnmutedConsumersCount = useWhoIsUnmutedConsumersCount();
  const whoIsTalkingConsumersCount = useWhoIsTalkingConsumersCount();
  const talkingUserConsumersCount = useTalkingUserConsumersCount();
  const skip = !(
    whoIsUnmutedConsumersCount
    + whoIsTalkingConsumersCount
    + talkingUserConsumersCount > 0
  );
  const { data: voiceActivity, loading: voiceActivityLoading } = useVoiceActivity(skip);
  const { data: userMuted, loading: userMutedLoading } = useUserMutedState(skip);
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());

  useEffect(() => {
    dispatchWhoIsUnmutedUpdate(userMuted);
    dispatchWhoIsTalkingUpdate(voiceActivity);
    dispatchTalkingUserUpdate(voiceActivity?.map((voice) => ({
      muted: userMuted?.find((u) => u.userId === voice.userId)?.muted ?? false,
      talking: voice.talking,
      userId: voice.userId,
    })));
  }, [voiceActivity, userMuted]);

  useEffect(() => {
    setWhoIsUnmutedLoading(voiceActivityLoading || userMutedLoading);
    setWhoIsTalkingLoading(voiceActivityLoading || userMutedLoading);
    setTalkingUserLoading(voiceActivityLoading || userMutedLoading);
  }, [voiceActivityLoading, userMutedLoading]);

  useEffect(() => {
    if (!connected) {
      dispatchWhoIsUnmutedUpdate(undefined);
      dispatchWhoIsTalkingUpdate(undefined);
      dispatchTalkingUserUpdate(undefined);
    }
  }, [connected]);

  return null;
};

export default VoiceActivityAdapter;
