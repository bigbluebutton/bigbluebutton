import React from 'react';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import getFromUserSettings from '/imports/ui/services/users-settings';
import LogoutConfirmation from './component';
import {
  isModerator,
  endMeeting,
} from './service';

const LogoutConfirmationContainer = props => (
  <LogoutConfirmation {...props} />
);

export default withRouter(withTracker(({ router }) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const shouldShowFeedback = !meetingIsBreakout() && getFromUserSettings('askForFeedbackOnLogout', APP_CONFIG.askForFeedbackOnLogout);
  const showFeedback = shouldShowFeedback ? () => router.push('/ended/430') : () => router.push('/logout');

  return {
    showEndMeeting: !meetingIsBreakout() && isModerator(),
    handleEndMeeting: endMeeting,
    showFeedback,
  };
})(LogoutConfirmationContainer));
