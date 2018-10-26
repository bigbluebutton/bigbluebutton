import React from 'react';
import Auth from '/imports/ui/services/auth';
import { withTracker } from 'meteor/react-meteor-data';
import UserPolls from './component';

const UserPollsContainer = ({ ...props }) => <UserPolls {...props} />;

export default withTracker(({ }) => {
  Meteor.subscribe('results', Auth.meetingID);
})(UserPollsContainer);
