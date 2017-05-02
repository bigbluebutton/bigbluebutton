import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { callServer } from '/imports/ui/services/api';
import Service from './service.js';

import UserList from './component.jsx';

class UserListContainer extends Component {
  render() {
    const {
      compact,
      users,
      currentUser,
      openChats,
      openChat,
      userActions,
      isBreakoutRoom,
      children,
    } = this.props;

    return (
      <UserList
        compact={compact}
        users={users}
        currentUser={currentUser}
        openChats={openChats}
        openChat={openChat}
        isBreakoutRoom={isBreakoutRoom}
        callServer={callServer}
        userActions={userActions}>
        {children}
      </UserList>
    );
  }
}

export default createContainer(({ params }) => ({
  users: Service.getUsers(),
  currentUser: Service.getCurrentUser(),
  openChats: Service.getOpenChats(params.chatID),
  openChat: params.chatID,
  userActions: Service.userActions,
  isBreakoutRoom: meetingIsBreakout(),
}), UserListContainer);
