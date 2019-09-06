import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Service from './service';
import UserList from './component';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const UserListContainer = props => <UserList {...props} />;

UserListContainer.propTypes = propTypes;

export default withTracker(({ chatID, compact }) => ({
  hasBreakoutRoom: Service.hasBreakoutRoom(),
  activeChats: Service.getActiveChats(chatID),
  isPublicChat: Service.isPublicChat,
  setEmojiStatus: Service.setEmojiStatus,
  roving: Service.roving,
  CustomLogoUrl: Service.getCustomLogoUrl(),
  compact,
  showBranding: getFromUserSettings('displayBrandingArea', Meteor.settings.public.app.branding.displayBrandingArea),
  requestUserInformation: Service.requestUserInformation,
}))(UserListContainer);
