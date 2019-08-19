import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import UserListItem from './component';

const UserListItemContainer = props => <UserListItem {...props} />;

export default withTracker(({ user }) => {
  const findUserInBreakout = Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${user.userId}`) });
  const breakoutSequence = (findUserInBreakout || {}).sequence;
  const Meeting = Meetings.findOne({ MeetingId: Auth.meetingID }, { fields: { meetingProp: 1 } });
  return {
    user: mapUser(user),
    userInBreakout: !!findUserInBreakout,
    breakoutSequence,
    meetignIsBreakout: Meeting && Meeting.meetingProp.isBreakout,
    isMeteorConnected: Meteor.status().connected,
  };
})(UserListItemContainer);
