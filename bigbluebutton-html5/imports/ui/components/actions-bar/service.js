import React from 'react';
import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { joinListenOnly } from '/imports/api/phone';
import { exitAudio } from '/imports/api/phone';

let isUserPresenter = () => {
  // check if user is a presenter
  return Users.findOne({
    userId: AuthSingleton.userID,
  }).user.presenter;
};

const handleExitAudio = () => exitAudio();

const handleJoinAudio = () => joinListenOnly();

export default {
  isUserPresenter,
  handleJoinAudio,
  handleExitAudio,
};
