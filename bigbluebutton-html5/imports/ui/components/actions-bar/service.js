import React from 'react';
import Auth from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';

let isUserPresenter = () => Users.findOne({
  userId: Auth.userID,
}).user.presenter;

export default {
  isUserPresenter,
};
