import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { joinListenOnly } from '/imports/api/phone';
import { exitAudio } from '/imports/api/phone';

let isUserPresenter = () => {
  // check if user is a presenter
  let isPresenter = Users.findOne({
    userId: AuthSingleton.userID,
  }).user.presenter;

  return {
    isUserPresenter: isPresenter,
  };
};

const handleExitAudio = () => exitAudio();

const handleJoinAudio = () => joinListenOnly();

export default {
  isUserPresenter,
  handleJoinAudio,
  handleExitAudio,
};
