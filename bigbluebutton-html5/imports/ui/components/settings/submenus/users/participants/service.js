import Users from '/imports/api/users';
import AuthSingleton from '/imports/ui/services/auth/index.js';

checkUserRoles = () => {
  const user = Users.findOne({
     userId: AuthSingleton.getCredentials().requesterUserId,
   }).user;

  return {
    isPresenter: user.presenter,
    role: user.role,
  };
};

export default {
  checkUserRoles,
};
