import React from 'react';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { createContainer } from 'meteor/react-meteor-data';
import LogoutConfirmation from './component';
import {
  isModerator,
  endMeeting,
} from './service';

const LogoutConfirmationContainer = props => (
  <LogoutConfirmation {...props} />
);

export default createContainer(() => {
  return {
    showEndMeeting: !meetingIsBreakout() &&
                    isModerator(),
    handleEndMeeting: endMeeting,
  }
}, LogoutConfirmationContainer);
