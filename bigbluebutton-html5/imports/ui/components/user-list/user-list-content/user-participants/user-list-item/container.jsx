import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import Auth from '/imports/ui/services/auth';
import UserListItem from './component';
import UserListService from '/imports/ui/components/user-list/service';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import { layoutDispatch } from '../../../../layout/context';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const UserListItemContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  const {
    toggleVoice,
    removeUser,
    toggleUserLock,
    changeRole,
    ejectUserCameras,
    assignPresenter,
    getAvailableActions,
    normalizeEmojiName,
    getGroupChatPrivate,
    hasPrivateChatBetweenUsers,
  } = UserListService;

  return <UserListItem {
    ...{
      layoutContextDispatch,
      toggleVoice,
      removeUser,
      toggleUserLock,
      changeRole,
      ejectUserCameras,
      assignPresenter,
      getAvailableActions,
      normalizeEmojiName,
      getGroupChatPrivate,
      hasPrivateChatBetweenUsers,
      ...props,
    }
  } />;
};
const isMe = (intId) => intId === Auth.userID;

export default withTracker(({ user }) => {
  const [MeetingSettings] = useMeetingSettings();
  const userConfig = MeetingSettings.public.user;
  const roleModerator = userConfig.role_moderator;
  const { label } = userConfig;

  const findUserInBreakout = user ? BreakoutService.getBreakoutUserIsIn(user.userId) : false;
  const findUserLastBreakout = user ? BreakoutService.getBreakoutUserWasIn(user.userId, null) : null;
  const breakoutSequence = (findUserInBreakout || {}).sequence;

  return {
    roleModerator,
    isMe,
    label,
    userInBreakout: !!findUserInBreakout,
    userLastBreakout: findUserLastBreakout,
    breakoutSequence,
    isMeteorConnected: Meteor.status().connected,
    voiceUser: user ? UserListService.curatedVoiceUser(user.userId) : null,
    getEmojiList: UserListService.getEmojiList(),
    getEmoji: UserListService.getEmoji(),
    usersProp: UserListService.getUsersProp(),
    selectedUserId: Session.get('dropdownOpenUserId'),
    isReactionsEnabled: UserReactionService.isEnabled(),
  };
})(UserListItemContainer);
