import React from 'react';
import users from './users';
import UserListItem from './UserListItem.jsx';

export default class UserList extends React.Component {
  render() {
    return (
      <table className={users['user-list']}>
        <tbody>
          {this.props.users.map((user) => <UserListItem key={user.id} user={user} currentUser={this.props.currentUser}/>)}
        </tbody>
      </table>
    );
  }
}
