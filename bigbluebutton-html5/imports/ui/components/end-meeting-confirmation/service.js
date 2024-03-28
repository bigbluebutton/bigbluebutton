import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

const getMeetingTitle = () => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { name: 1, 'breakoutPolicies.sequence': 1 } });

  return meeting.name;
};

const getUsers = () => {
  const numUsers = Users.find({
    meetingId: Auth.meetingID,
    userId: { $ne: Auth.userID },
  }, { fields: { _id: 1 } }).count();

  return numUsers;
};

export default {
  getUsers,
  getMeetingTitle,
};
