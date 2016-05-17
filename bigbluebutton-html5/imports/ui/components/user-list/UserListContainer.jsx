import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import UserList from './UserList.jsx';

const USERS = [
  {
    id: 1,
    name: 'Fred',
    isModerator: true,
    isPresenter: true
  }, {
    name: 'Richard',
    id: 2,
    isModerator: true,
    isCurrent: true
  }, {
    name: 'Tiago',
    id: 3,
    isPresenter: true,
    isVoiceUser: true
  }, {
    name: 'Felipe',
    id:4
  }
]

class UserListContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <UserList
        {...this.props}
        users={USERS}>
        {this.props.children}
      </UserList>
    );
  }
}

export default createContainer(() => {
  return {};
}, UserListContainer);
