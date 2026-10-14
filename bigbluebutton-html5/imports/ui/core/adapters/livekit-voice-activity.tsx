import React from 'react';
import useShouldUseLiveKitAudioState, {
  useIsUsingLiveKitAudio,
} from '/imports/ui/core/hooks/livekit/useShouldUseLiveKitAudioState';
import {
  useDeriveWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
} from '/imports/ui/core/hooks/livekit/useWhoIsUnmutedLiveKit';
import {
  useDeriveWhoIsTalking,
  useWhoIsTalkingConsumersCount,
} from '/imports/ui/core/hooks/livekit/useWhoIsTalkingLiveKit';

const UnmutedDerivation = () => {
  useDeriveWhoIsUnmuted();

  return null;
};

const TalkingDerivation = () => {
  useDeriveWhoIsTalking();

  return null;
};

// A derivation mounts only while its store has consumers and its source is in
// use: outside of that its effect has nothing to write.
const LiveKitVoiceActivityAdapter = () => {
  const isUsingLiveKitAudio = useIsUsingLiveKitAudio();
  const shouldUseLiveKitAudioState = useShouldUseLiveKitAudioState();
  const unmutedConsumersCount = useWhoIsUnmutedConsumersCount();
  const talkingConsumersCount = useWhoIsTalkingConsumersCount();

  return (
    <>
      {isUsingLiveKitAudio && unmutedConsumersCount > 0 && <UnmutedDerivation />}
      {shouldUseLiveKitAudioState && talkingConsumersCount > 0 && <TalkingDerivation />}
    </>
  );
};

export default LiveKitVoiceActivityAdapter;
