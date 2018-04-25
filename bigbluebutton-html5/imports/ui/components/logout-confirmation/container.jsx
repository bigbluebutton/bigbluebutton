import React from 'react';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import FeedbackContainer from '/imports/ui/components/feedback-screen/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import LogoutConfirmation from './component';
import {
  isModerator,
  endMeeting,
} from './service';

const LogoutConfirmationContainer = props => (
  <LogoutConfirmation {...props} />
);

export default withRouter(withModalMounter(withTracker(({ mountModal, router }) => {
  const APP_CONFIG = Meteor.settings.public.app;
  const shouldShowFeedback = !meetingIsBreakout() && APP_CONFIG.askForFeedbackOnLogout;
  const showFeedback = shouldShowFeedback ? () => mountModal(<FeedbackContainer />) : () => router.push('/logout');

  return {
    showEndMeeting: !meetingIsBreakout() && isModerator(),
    handleEndMeeting: endMeeting,
    showFeedback,
  };
})(LogoutConfirmationContainer)));
