import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import EndMeetingComponent from './component';

const EndMeetingContainer = props => <EndMeetingComponent {...props} />;

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal() {
    mountModal(null);
  },

  endMeeting: () => {
    const isUserModerator = Users.findOne({ userId: Auth.userID }).role === ROLE_MODERATOR;
    if (isUserModerator) makeCall('endMeeting');
    mountModal(null);
  },

}))(EndMeetingContainer));
