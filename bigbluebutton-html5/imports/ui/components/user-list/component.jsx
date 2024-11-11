import React, { PureComponent } from 'react';
import Styled from './styles';
import UserContentContainer from './user-list-content/container';

class UserList extends PureComponent {
  render() {
    return (
      <Styled.UserList>
        <UserContentContainer />
      </Styled.UserList>
    );
  }
}

export default UserList;
