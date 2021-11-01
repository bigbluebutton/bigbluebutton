import Users from '/imports/ui/local-collections/users-collection/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/ui/local-collections/meetings-collection/meetings';

const getMeetingTitle = () => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1 } });

  return meeting.meetingProp.name;
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
