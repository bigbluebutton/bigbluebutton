import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const mapUser = user => ({
  id: user.userid,
  isPresenter: user.presenter,
  isModerator: user.role === ROLE_MODERATOR,
});

getCurrentUser = () => {
  let currentUserId = Auth.userID;
  let currentUser = Users.findOne({ 'user.userid': currentUserId });

  return (currentUser) ? mapUser(currentUser.user) : null;
};

export default {
  getCurrentUser,
};
