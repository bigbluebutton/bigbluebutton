import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import Meetings from '/imports/api/meetings';
import Slides from '/imports/api/slides';
import Auth from '/imports/ui/services/auth';
import UserListItem from './component';
import UserListService from '/imports/ui/components/user-list/service';
import { makeCall } from '/imports/ui/services/api';
import PresentationAreaService from '/imports/ui/components/presentation/service';

const UserListItemContainer = props => <UserListItem {...props} />;
const isMe = intId => intId === Auth.userID;

export default withTracker(({ user }) => {
  const findUserInBreakout = BreakoutService.getBreakoutUserIsIn(user.userId);
  const breakoutSequence = (findUserInBreakout || {}).sequence;
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { lockSettingsProps: 1 } });

  const currentSlide = PresentationAreaService.getCurrentSlide('DEFAULT_PRESENTATION_POD');

  const changeWhiteboardMode = (multiUser, userId) => {
    makeCall('changeWhiteboardAccess', multiUser, currentSlide.id, userId);
  };

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
    normalizeEmojiName: UserListService.normalizeEmojiName,
    getGroupChatPrivate: UserListService.getGroupChatPrivate,
    getEmojiList: UserListService.getEmojiList(),
    getEmoji: UserListService.getEmoji(),
    hasPrivateChatBetweenUsers: UserListService.hasPrivateChatBetweenUsers,
    changeWhiteboardMode,
  };
})(UserListItemContainer);
