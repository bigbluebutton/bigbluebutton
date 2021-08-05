import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Service from '/imports/ui/components/user-list/service';
import UserList from './component';

const propTypes = {
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const UserListContainer = (props) => <UserList {...props} />;

UserListContainer.propTypes = propTypes;

export default withTracker(({ compact }) => (
  {
    hasBreakoutRoom: Service.hasBreakoutRoom(),
    isPublicChat: Service.isPublicChat,
    setEmojiStatus: Service.setEmojiStatus,
    clearAllEmojiStatus: Service.clearAllEmojiStatus,
    roving: Service.roving,
    CustomLogoUrl: Service.getCustomLogoUrl(),
    compact,
    getGroupChatPrivate: Service.getGroupChatPrivate,
    handleEmojiChange: Service.setEmojiStatus,
    getEmojiList: Service.getEmojiList(),
    getEmoji: Service.getEmoji(),
    showBranding: getFromUserSettings('bbb_display_branding_area', Meteor.settings.public.app.branding.displayBrandingArea),
    hasPrivateChatBetweenUsers: Service.hasPrivateChatBetweenUsers,
    toggleUserLock: Service.toggleUserLock,
    requestUserInformation: Service.requestUserInformation,
  }
))(UserListContainer);
