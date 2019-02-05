import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Service from './service';
import UserList from './component';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  getUsersId: PropTypes.func.isRequired,
  isBreakoutRoom: PropTypes.bool.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  getGroupChatPrivate: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
};

const UserListContainer = props => <UserList {...props} />;

UserListContainer.propTypes = propTypes;

export default withTracker(({ chatID, compact }) => ({
  hasBreakoutRoom: Service.hasBreakoutRoom(),
  getUsersId: Service.getUsersId,
  currentUser: Service.getCurrentUser(),
  activeChats: Service.getActiveChats(chatID),
  isBreakoutRoom: meetingIsBreakout(),
  getAvailableActions: Service.getAvailableActions,
  normalizeEmojiName: Service.normalizeEmojiName,
  isMeetingLocked: Service.isMeetingLocked,
  isPublicChat: Service.isPublicChat,
  setEmojiStatus: Service.setEmojiStatus,
  assignPresenter: Service.assignPresenter,
  removeUser: Service.removeUser,
  toggleVoice: Service.toggleVoice,
  muteAllUsers: Service.muteAllUsers,
  muteAllExceptPresenter: Service.muteAllExceptPresenter,
  changeRole: Service.changeRole,
  roving: Service.roving,
  CustomLogoUrl: Service.getCustomLogoUrl(),
  compact,
  getGroupChatPrivate: Service.getGroupChatPrivate,
  handleEmojiChange: Service.setEmojiStatus,
  getEmojiList: Service.getEmojiList(),
  getEmoji: Service.getEmoji(),
  showBranding: getFromUserSettings('displayBrandingArea', Meteor.settings.public.app.branding.displayBrandingArea),
  hasPrivateChatBetweenUsers: Service.hasPrivateChatBetweenUsers,
  toggleUserLock: Service.toggleUserLock,
}))(UserListContainer);
