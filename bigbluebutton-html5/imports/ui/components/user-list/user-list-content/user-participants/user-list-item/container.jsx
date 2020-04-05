import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { formatNumber } from '/imports/utils/intl-formatter';
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
    isThisMeetingLocked: UserListService.isMeetingLocked(Auth.meetingID),
    voiceUser: UserListService.curatedVoiceUser(user.userId),
    toggleVoice: UserListService.toggleVoice,
    removeUser: UserListService.removeUser,
    toggleUserLock: UserListService.toggleUserLock,
    changeRole: UserListService.changeRole,
    assignPresenter: UserListService.assignPresenter,
    getAvailableActions: UserListService.getAvailableActions,
    normalizeEmojiName: UserListService.normalizeEmojiName,
    getGroupChatPrivate: UserListService.getGroupChatPrivate,
    getEmojiList: UserListService.getEmojiList(),
    getEmoji: UserListService.getEmoji(),
    hasPrivateChatBetweenUsers: UserListService.hasPrivateChatBetweenUsers,
    formatNumber,
  };
})(UserListItemContainer);
