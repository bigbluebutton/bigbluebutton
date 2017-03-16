import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { joinListenOnly } from '/imports/api/phone';
import { showModal } from '/imports/ui/components/app/service';
import Audio from '/imports/ui/components/audio-modal/component';
import React, { Component } from 'react';

let isUserPresenter = () => {

  // check if user is a presenter
  return isPresenter = Users.findOne({
    userId: AuthSingleton.getCredentials().requesterUserId,
  }).user.presenter;
};

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<Audio handleJoinListenOnly={handleJoinListenOnly} />);
}

export default {
  isUserPresenter,
  handleJoinAudio,
};
