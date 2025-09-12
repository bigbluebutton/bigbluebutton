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
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());

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
