import React from 'react';
import {UserListItem} from './UserListItem.jsx';
import users from './users';

export let UserList = React.createClass({
  render() {
    return (
      <table className={users['user-list']}>
        <tbody>
          {this.props.users.map((user) => <UserListItem key={user.id} user={user} currentUser={this.props.currentUser}/>)}
        </tbody>
      </table>
    );
  },
});;
