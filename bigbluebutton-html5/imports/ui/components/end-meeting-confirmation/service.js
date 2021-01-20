import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

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

export default {
  getUsers,
  getMeetingTitle,
};