import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import mapUser from '/imports/ui/services/user/mapUser';
import UserListItem from './component';

const UserListItemContainer = props => <UserListItem {...props} />;

export default withTracker(({ userId }) => ({
  user: mapUser(Users.findOne({ userId })),
}))(UserListItemContainer);
