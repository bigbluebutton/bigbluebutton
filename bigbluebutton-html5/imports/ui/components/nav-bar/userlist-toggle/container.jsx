import React from 'react';
import { withRouter } from 'react-router';
import { createContainer } from 'meteor/react-meteor-data';
import userListService from '/imports/ui/components/user-list/service';
import ChatService from '/imports/ui/components/chat/service';
import Auth from '/imports/ui/services/auth';
import UserListToggle from './component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const UserListToggleContainer = props => <UserListToggle {...props} />;

export default withRouter(createContainer(({ location, router }) => {
  const isExpanded = location.pathname.indexOf('/users') !== -1;

  const checkUnreadMessages = () => {
    const users = userListService.getUsers();

    // 1.map every user id
    // 2.filter the user except the current user from the user array
    // 3.add the public chat to the array
    // 4.check current user has unread messages or not.
    return users
      .map(user => user.id)
      .filter(userID => userID !== Auth.userID)
      .concat(PUBLIC_CHAT_KEY)
      .some(receiverID => ChatService.hasUnreadMessages(receiverID));
  };

  return {
    isExpanded,
    hasUnreadMessages: checkUnreadMessages(),
    handleToggleUserList: () => {
      if (location.pathname.indexOf('/users') !== -1) {
        router.push('/');
      } else {
        router.push('/users');
      }
    },
  };
}, UserListToggleContainer));
