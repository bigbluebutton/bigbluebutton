import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Service from './service.js';

import UserList from './component.jsx';

class UserListContainer extends Component {
  render() {
    return (
      <UserList
        {...this.props}
        users={this.props.users}>
        {this.props.children}
      </UserList>
    );
  }
}

export default createContainer(() => ({
  users: Service.getUsers(),
}), UserListContainer);
