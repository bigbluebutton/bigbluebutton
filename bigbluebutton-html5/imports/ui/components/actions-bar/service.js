import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';

let isUserPresenter = () => {

  // check if user is a presenter
  let thisUser = Users.findOne({
    userId: AuthSingleton.getCredentials().requesterUserId,
  });

  const isUserPresenter = !!thisUser && thisUser.user.presenter;
  return {
    isUserPresenter,
  };
};

export default {
  isUserPresenter,
};
