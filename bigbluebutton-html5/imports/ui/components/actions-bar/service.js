import React from 'react';
import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';

let isUserPresenter = () => {

  // check if user is a presenter
  return Users.findOne({
    userId: AuthSingleton.userID,
  }).user.presenter;
};

export default {
  isUserPresenter,
};
