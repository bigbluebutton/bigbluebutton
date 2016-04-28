import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import UserList from './UserList.jsx';

class UserListContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <UserList {...this.props}>
        {this.props.children}
      </UserList>
    );
  }
}

export default createContainer(() => {
  return {};
}, UserListContainer);
