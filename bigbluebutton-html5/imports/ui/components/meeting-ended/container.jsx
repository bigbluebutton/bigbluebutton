import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import MeetingEnded from './component';

const MeetingEndedContainer = props => <MeetingEnded {...props} />;

export default withModalMounter(withTracker(() => {
  const APP_CONFIG = Meteor.settings.public.app;
  const shouldShowFeedback = !meetingIsBreakout() && APP_CONFIG.askForFeedbackOnLogout;
  return {
    shouldShowFeedback,
  };
})(MeetingEndedContainer));
