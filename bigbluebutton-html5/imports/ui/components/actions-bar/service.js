import React from 'react';
import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { joinListenOnly } from '/imports/api/phone';
import { showModal } from '/imports/ui/components/app/service';
import { exitAudio } from '/imports/api/phone';
import Audio from '/imports/ui/components/audio/audio-modal/component';

let isUserPresenter = () => {

  // check if user is a presenter
  let isPresenter = Users.findOne({
    userId: AuthSingleton.userID,
  }).user.presenter;

  return {
    isUserPresenter: isPresenter,
  };
};

const handleExitAudio = () => {
  return exitAudio();
}

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<Audio handleJoinListenOnly={handleJoinListenOnly} />);
}

export default {
  isUserPresenter,
  handleJoinAudio,
  handleExitAudio,
};
