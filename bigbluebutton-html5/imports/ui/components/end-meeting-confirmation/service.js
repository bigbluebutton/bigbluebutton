import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

const USERS_TO_DISPLAY = Meteor.settings.public.app.maxUsersForConfirmation;

const userFindSorting = {
  emojiTime: 1,
  role: 1,
  phoneUser: 1,
  sortName: 1,
  userId: 1,
};

const getMeetingTitle = () => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1 } });

  return meeting.meetingProp.name;
};

const getUsers = () => {
  const users = Users
    .find({
      meetingId: Auth.meetingID,
    }, userFindSorting)
    .fetch();

  return users;
};

const getUsersToDisplay = (users) => {
  const diff = users.length - USERS_TO_DISPLAY;
  return { displayUsers: users.slice(0, USERS_TO_DISPLAY), remainder: diff <= 0 ? false : diff };
};

export default {
  getUsers,
  getUsersToDisplay,
  getMeetingTitle,
};
