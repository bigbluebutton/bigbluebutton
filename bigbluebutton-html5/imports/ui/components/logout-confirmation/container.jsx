import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import LogoutConfirmation from './component';
import LogoutConfirmationService from './service';

const LogoutConfirmationContainer = () => (
  <LogoutConfirmation {...this.props} />
);

export default createContainer(() => ({
  showEndMeeting: !LogoutConfirmationService.isBreakout() &&
                  LogoutConfirmationService.isModerator(),
  endMeeting: LogoutConfirmationService.endMeeting,
}), LogoutConfirmationContainer);
