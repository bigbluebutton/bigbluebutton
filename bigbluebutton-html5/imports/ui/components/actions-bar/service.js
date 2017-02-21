import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';

let isUserPresenter = () => {

  // check if user is a presenter
  let isPresenter = Users.findOne({
    userId: AuthSingleton.getCredentials().requesterUserId,
  }).user.presenter;

  return {
    isUserPresenter: isPresenter,
  };
};

let isInVoiceAudio = () => {
  return isInAudio = Users.findOne({
    userId: AuthSingleton.getCredentials().requesterUserId,
  }).user.voiceUser.joined;
};

export default {
  isUserPresenter,
  isInVoiceAudio,
};
