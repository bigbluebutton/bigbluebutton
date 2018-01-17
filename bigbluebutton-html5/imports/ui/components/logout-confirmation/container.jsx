import React from 'react';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { withTracker } from 'meteor/react-meteor-data';
import LogoutConfirmation from './component';
import {
  isModerator,
  endMeeting,
} from './service';

const LogoutConfirmationContainer = props => (
  <LogoutConfirmation {...props} />
);

export default withTracker(() => ({
  showEndMeeting: !meetingIsBreakout() && isModerator(),
  handleEndMeeting: endMeeting,
}))(LogoutConfirmationContainer);
