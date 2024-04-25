import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';

const DIAL_IN_USER = 'dial-in-user';

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const currentBreakoutUsers = (user) => !Breakouts.findOne({
  'joinedUsers.userId': new RegExp(`^${user.userId}`),
});

const filterBreakoutUsers = (filter) => (users) => users.filter(filter);

const getUsersNotJoined = filterBreakoutUsers(currentBreakoutUsers);

const isMe = (intId) => intId === Auth.userID;

export default {
  isMe,
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { name: 1 } }).name,
  users: () => Users.find({
    meetingId: Auth.meetingID,
    clientType: { $ne: DIAL_IN_USER },
  }).fetch(),
  groups: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { groups: 1 } }).groups,
  isBreakoutRecordable: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'breakoutProps.record': 1 } }).breakoutProps.record,
  breakoutJoinedUsers: () => Breakouts.find({
    joinedUsers: { $exists: true },
  }, { fields: { joinedUsers: 1, breakoutId: 1, sequence: 1 }, sort: { sequence: 1 } }).fetch(),
  getBreakouts,
  getUsersNotJoined,
};
