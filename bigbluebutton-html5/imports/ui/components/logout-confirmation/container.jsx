import React from 'react';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';

import LogoutConfirmation from './component';
import {
  isModerator,
  endMeeting,
} from './service';

const LogoutConfirmationContainer = props => (
  <LogoutConfirmation {...props} />
);

export default withTracker(() => {
  const confirmLeaving = () => {
    Session.set('isMeetingEnded', true);
    Session.set('codeError', '430');
  };

  return {
    showEndMeeting: !meetingIsBreakout() && isModerator(),
    handleEndMeeting: endMeeting,
    confirmLeaving,
  };
})(LogoutConfirmationContainer);
