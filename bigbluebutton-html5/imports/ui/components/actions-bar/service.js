import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';

let isUserPresenter = () => {
  let userIsPresenter;

  // Get user to check if they are the presenter
  userIsPresenter = Users.findOne({
    userId: AuthSingleton.getCredentials().requesterUserId,
  }).user.presenter;

  return {
    userIsPresenter: userIsPresenter,
  };
};

export default {
  isUserPresenter,
};
