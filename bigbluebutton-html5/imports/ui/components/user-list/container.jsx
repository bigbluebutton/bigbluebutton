import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Service from './service.js';

import UserList from './component.jsx';

class UserListContainer extends Component {
  render() {
    return (
      <UserList
        users={this.props.users}
        currentUser={this.props.currentUser}
        openChats={this.props.openChats}
        openChat={this.props.openChat}
        userActions={this.props.userActions}>
        {this.props.children}
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
}), UserListContainer);
