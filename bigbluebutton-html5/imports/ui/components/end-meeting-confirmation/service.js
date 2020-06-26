import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const USERS_TO_DISPLAY = Meteor.settings.public.app.maxUsersForConfirmation;

const userFindSorting = {
  emojiTime: 1,
  role: 1,
  phoneUser: 1,
  sortName: 1,
  userId: 1,
};

const getUsers = () => {
  let users = Users
    .find({
      meetingId: Auth.meetingID,
      connectionStatus: 'online',
    }, userFindSorting)
    .fetch();

  // user shouldn't see themselves in the list
  users = users.filter(u => u.userId !== Auth.userID);

  return users;
};

const getUsersToDisplay = (users) => {
  const diff = users.length - USERS_TO_DISPLAY;
  return { displayUsers: users.slice(0, USERS_TO_DISPLAY), remainder: diff <= 0 ? false : diff };
};

export default {
  getUsers,
  getUsersToDisplay,
};
