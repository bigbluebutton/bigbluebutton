import React from 'react';
import LocalEchoService from '/imports/ui/components/audio/local-echo/service';
import LocalEcho from '/imports/ui/components/audio/local-echo/component';

const LocalEchoContainer = (props) => {
  const {
    initialHearingState: settingsHearingState,
  } = window.meetingClientSettings.public.media.localEchoTest;
  const initialHearingState = settingsHearingState;

  return (
    <LocalEcho
      {...props}
      initialHearingState={initialHearingState}
      playEchoStream={LocalEchoService.playEchoStream}
      deattachEchoStream={LocalEchoService.deattachEchoStream}
      shouldUseRTCLoopback={LocalEchoService.shouldUseRTCLoopback}
      createAudioRTCLoopback={LocalEchoService.createAudioRTCLoopback}
      setAudioSink={LocalEchoService.setAudioSink}
    />
  );
};

export default LocalEchoContainer;
