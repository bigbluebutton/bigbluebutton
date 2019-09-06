import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UserListItem from './component';
import UserListService from '/imports/ui/components/user-list/service';
import Service from '../../../service';

const UserListItemContainer = props => <UserListItem {...props} />;
const isMe = intId => intId === Auth.userID;

export default withTracker(({ user }) => {
  const findUserInBreakout = Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${user.userId}`) });
  const breakoutSequence = (findUserInBreakout || {}).sequence;
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { lockSettingsProps: 1 } });

  return {
    user,
    isMe,
    userInBreakout: !!findUserInBreakout,
    breakoutSequence,
    lockSettingsProps: Meeting && Meeting.lockSettingsProps,
    isMeteorConnected: Meteor.status().connected,
    isThisMeetingLocked: UserListService.isMeetingLocked(Auth.meetingID),
    voiceUser: UserListService.curatedVoiceUser(user.userId),
    toggleVoice: UserListService.toggleVoice,
    removeUser: UserListService.removeUser,
    toggleUserLock: UserListService.toggleUserLock,
    changeRole: UserListService.changeRole,
    assignPresenter: UserListService.assignPresenter,
    getAvailableActions: UserListService.getAvailableActions,
    normalizeEmojiName: Service.normalizeEmojiName,
    getGroupChatPrivate: Service.getGroupChatPrivate,
    getEmojiList: Service.getEmojiList(),
    getEmoji: Service.getEmoji(),
    hasPrivateChatBetweenUsers: Service.hasPrivateChatBetweenUsers,
  };
})(UserListItemContainer);
