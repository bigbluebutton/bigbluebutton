import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import LocalEcho from '/imports/ui/components/audio/local-echo/component';

const LocalEchoContainer = (props) => <LocalEcho {...props} />;

export default withTracker(() => ({
  initialHearingState: Service.localEchoInitHearingState,
}))(LocalEchoContainer);
