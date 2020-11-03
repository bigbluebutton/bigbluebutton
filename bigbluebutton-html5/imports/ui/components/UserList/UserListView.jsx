import React, { Fragment } from 'react';

import UserAvatar from '../UserAvatar';

const UserListView = ({
  users,
}) => (
  <Fragment>
    {
        users.map(user => (
          <UserAvatar
            key={user._id}
            color={user.color}
          >
            {user.name.toUpperCase().slice(0, 2)}

          </UserAvatar>

        ))
    }
  </Fragment>
);


export default UserListView;
