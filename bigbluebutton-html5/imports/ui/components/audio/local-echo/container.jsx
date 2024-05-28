import React from 'react';
import Service from '/imports/ui/components/audio/service';
import LocalEcho from '/imports/ui/components/audio/local-echo/component';

const LocalEchoContainer = (props) => (
  <LocalEcho {...props} initialHearingState={Service.localEchoInitHearingState} />
);

export default LocalEchoContainer;
