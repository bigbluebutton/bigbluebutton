import React from 'react';
import LocalEcho from '/imports/ui/components/audio/local-echo/component';

const LocalEchoContainer = (props) => {
  const { initialHearingState } = window.meetingClientSettings.public.media.localEchoTest;

  return <LocalEcho {...props} initialHearingState={initialHearingState} />;
};

export default LocalEchoContainer;
