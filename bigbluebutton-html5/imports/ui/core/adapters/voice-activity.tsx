import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import useVoiceActivity from '/imports/ui/core/hooks/useVoiceActivity';
import useShouldUseLiveKitAudioState from '/imports/ui/core/hooks/livekit/useShouldUseLiveKitAudioState';
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
  const shouldUseLiveKitAudioState = useShouldUseLiveKitAudioState();
  const whoIsUnmutedConsumersCount = useWhoIsUnmutedConsumersCount();
  const whoIsTalkingConsumersCount = useWhoIsTalkingConsumersCount();
  const talkingUserConsumersCount = useTalkingUserConsumersCount();
  const skip = !(
    whoIsUnmutedConsumersCount
    + whoIsTalkingConsumersCount
    + talkingUserConsumersCount > 0
  );
  const { data: voiceActivity, loading: voiceActivityLoading } = useVoiceActivity(skip);
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());

  useEffect(() => {
    dispatchWhoIsUnmutedUpdate(voiceActivity);
    dispatchWhoIsTalkingUpdate(voiceActivity);
    dispatchTalkingUserUpdate(voiceActivity);
  }, [voiceActivity]);

  useEffect(() => {
    setWhoIsUnmutedLoading(voiceActivityLoading);
    setWhoIsTalkingLoading(voiceActivityLoading);
    setTalkingUserLoading(voiceActivityLoading);
  }, [voiceActivityLoading]);

  useEffect(() => {
    // Only clear updates on disconnection when using BBB/GraphQL audio state.
    // LiveKit state should be resilient to GraphQL disconnections on certain
    // occasions. Complete absence of data from either sources is treated in
    // the LK hooks.
    if (!connected && !shouldUseLiveKitAudioState) {
      dispatchWhoIsUnmutedUpdate(undefined);
      dispatchWhoIsTalkingUpdate(undefined);
      dispatchTalkingUserUpdate(undefined);
    }
  }, [connected, shouldUseLiveKitAudioState]);

  return null;
};

export default VoiceActivityAdapter;
