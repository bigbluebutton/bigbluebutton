import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Auth from '/imports/ui/services/auth';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Users from '/imports/api/users';
import MeetingEnded from './component';

const MeetingEndedContainer = props => <MeetingEnded {...props} />;

export default withModalMounter(withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID });
  const APP_CONFIG = Meteor.settings.public.app;
  const shouldShowFeedback = !meetingIsBreakout() && APP_CONFIG.askForFeedbackOnLogout;
  console.log(shouldShowFeedback);
  return {
    // userName: user.name,
    shouldShowFeedback,
  };
})(MeetingEndedContainer));
