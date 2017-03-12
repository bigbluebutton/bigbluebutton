import Users from '/imports/api/users';
import AuthSingleton from '/imports/ui/services/auth/index.js';

checkUserRoles = () => {
  let user = Users.findOne({
    userId: AuthSingleton.getCredentials().requesterUserId,
  });

  let isPresenter = false;
  let role = null;

  if (user != null && user.user != null) {
    user = user.user;
    isPresenter = user.presenter;
    role = user.role;
  }
  return {
    isPresenter,
    role,
  };
};

export default {
  checkUserRoles,
};
