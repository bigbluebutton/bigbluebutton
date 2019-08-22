import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UserListItem from './component';
import Users from '/imports/api/users';
import UserListService from '/imports/ui/components/user-list/service';

const UserListItemContainer = props => <UserListItem {...props} />;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

export default withTracker(({ user }) => {
  const findUserInBreakout = Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${user.userId}`) });
  const breakoutSequence = (findUserInBreakout || {}).sequence;
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.isBreakout': 1 } });
  const isModerator = (intId) => {
    const User = Users.findOne({ meetingId: Auth.meetingID, intId }, { fields: { role: 1 } });
    return User.role === ROLE_MODERATOR;
  };

  const isMe = intId => intId === Auth.userID;

  return {
    user,
    isModerator,
    isMe,
    userInBreakout: !!findUserInBreakout,
    breakoutSequence,
    meetingIsBreakout: Meeting && Meeting.meetingProp.isBreakout,
    isMeteorConnected: Meteor.status().connected,
    isThisMeetingLocked: UserListService.isMeetingLocked(Auth.meetingID),
    getMyVoiceUser: UserListService.curatedVoiceUser(Auth.userID),
  };
})(UserListItemContainer);
