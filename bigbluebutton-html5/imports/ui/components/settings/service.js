import Users from '/imports/api/users';
import AuthSingleton from '/imports/ui/services/auth/index.js';

checkUserRoles = () => {
  let user = Users.findOne({
     userId: AuthSingleton.getCredentials().requesterUserId,
   });

  if (user != null && user.user != null) {
    user = user.user;
  }

  return {
    isPresenter: user.presenter,
    role: user.role,
  };
};

export default {
  checkUserRoles,
};
