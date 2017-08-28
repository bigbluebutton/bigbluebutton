import React from 'react';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/2.0/users';

const isUserPresenter = () => Users.findOne({
  userId: Auth.userID,
}).presenter;

export default {
  isUserPresenter,
};
