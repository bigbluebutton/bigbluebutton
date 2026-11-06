import React from 'react';
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
    />
  );
};

export default LocalEchoContainer;
