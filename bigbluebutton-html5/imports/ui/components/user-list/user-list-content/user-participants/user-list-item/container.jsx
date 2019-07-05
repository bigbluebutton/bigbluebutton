import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import UserListItem from './component';

const UserListItemContainer = props => <UserListItem {...props} />;

export default withTracker(({ userId }) => {
  const findUserInBreakout = Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${userId}`) });
  const breakoutSequence = (findUserInBreakout || {}).sequence;
  const Meeting = Meetings.findOne({ MeetingId: Auth.meetingID });
  return {
    user: mapUser(Users.findOne({ userId })),
    userInBreakout: !!findUserInBreakout,
    breakoutSequence,
    meetignIsBreakout: Meeting && Meeting.meetingProp.isBreakout,
    isMeteorConnected: Meteor.status().connected,
  };
})(UserListItemContainer);
