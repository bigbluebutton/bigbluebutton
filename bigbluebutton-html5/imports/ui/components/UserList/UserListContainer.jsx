import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListView from './UserListView';
import UserListService from '/imports/ui/components/user-list/service';
// import Auth from '/imports/ui/services/auth';

const UserListContainer = props => <UserListView {...props} />;

export default withTracker(() => ({
  users: UserListService.getUsers(),
//   currentUser: UserListService.getUser(Auth.userID),
}))(UserListContainer);
