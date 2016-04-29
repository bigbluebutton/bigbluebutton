import React from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import UserList from './UserList.jsx';
import {mapUsers} from './UserListService.js';

class UserListContainer extends React.Component {
  render() {
    return <UserList users={this.props.users.users} currentUser={this.props.users.currentUser}/>;
  }
};

export default createContainer(() => {
  return {
    users: mapUsers()
  };
}, UserListContainer);
