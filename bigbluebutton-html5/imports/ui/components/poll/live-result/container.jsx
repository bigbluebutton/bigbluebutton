import React from 'react';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Auth from '/imports/ui/services/auth';
import LiveResult from './component';
import { createContainer } from 'meteor/react-meteor-data';

const LiveResultContainer = ({ ...props }) => <LiveResult {...props} />;

export default createContainer(() => {
  const getUser = userId => Users.findOne({ userId });

  const currentUser = Users.findOne({ userId: Auth.userID });

  const currentPoll = Polls.findOne({ meetingId: Auth.meetingID });

  const subs = Meteor.subscribe('results', Auth.meetingID);

  return {
    getUser,
    currentUser,
    currentPoll,
    loading: !subs.ready(),
  };
}, LiveResultContainer);
