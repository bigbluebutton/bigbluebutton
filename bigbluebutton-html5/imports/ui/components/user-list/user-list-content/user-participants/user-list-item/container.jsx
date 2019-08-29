import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UserListItem from './component';
import UserListService from '/imports/ui/components/user-list/service';

const UserListItemContainer = props => <UserListItem {...props} />;

export default withTracker(({ user }) => {
  const findUserInBreakout = Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${user.userId}`) });
  const breakoutSequence = (findUserInBreakout || {}).sequence;
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.isBreakout': 1, lockSettingsProps: 1 } });

  const isMe = intId => intId === Auth.userID;

  return {
    user,
    isModerator: UserListService.isUserModerator,
    isMe,
    userInBreakout: !!findUserInBreakout,
    breakoutSequence,
    lockSettingsProps: Meeting && Meeting.lockSettingsProps,
    meetingIsBreakout: Meeting && Meeting.meetingProp.isBreakout,
    isMeteorConnected: Meteor.status().connected,
    isThisMeetingLocked: UserListService.isMeetingLocked(Auth.meetingID),
    getMyVoiceUser: UserListService.curatedVoiceUser(Auth.userID),
  };
})(UserListItemContainer);
