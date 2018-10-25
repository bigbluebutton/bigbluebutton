import React from 'react';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Auth from '/imports/ui/services/auth';
import { withTracker } from 'meteor/react-meteor-data';
import UserPolls from './component';

const UserPollsContainer = ({ ...props }) => <UserPolls {...props} />;

export default withTracker(({ }) => {
  Meteor.subscribe('results', Auth.meetingID);

  // const getUser = userId => Users.findOne({ userId });

  // const currentUser = Users.findOne({ userId: Auth.userID });

  // const currentPoll = Polls.findOne({ meetingId: Auth.meetingID });

  return {
    // currentUser,
    // currentPoll,
  };
})(UserPollsContainer);
