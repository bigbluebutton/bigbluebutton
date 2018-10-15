import React from 'react';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Auth from '/imports/ui/services/auth';
import { withTracker } from 'meteor/react-meteor-data';
import LiveResult from './component';

const LiveResultContainer = ({ ...props }) => <LiveResult {...props} />;

export default withTracker(({ }) => {
  Meteor.subscribe('current-poll', Auth.meetingID);

  const getUser = userId => Users.findOne({ userId });

  const currentUser = Users.findOne({ userId: Auth.userID });

  const currentPoll = Polls.findOne({ meetingId: Auth.meetingID });

  return {
    getUser,
    currentUser,
    currentPoll,
  };
})(LiveResultContainer);
