import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import Users from '/imports/api/users';
import fp from 'lodash/fp';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const findBreakouts = () => {
  const BreakoutRooms = Breakouts.find({
    parentMeetingId: Auth.meetingID,
  }, {
    sort: {
      sequence: 1,
    },
  }).fetch();

  return BreakoutRooms;
};

const breakoutRoomUser = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter(breakout => breakout.breakoutId === breakoutId).shift();
  const breakoutUser = breakoutRoom.users.filter(user => user.userId === Auth.userID).shift();
  return breakoutUser;
};

const closeBreakoutPanel = () => Session.set('openPanel', 'userlist');

const endAllBreakouts = () => {
  makeCall('endAllBreakouts');
  closeBreakoutPanel();
};

const requestJoinURL = (breakoutId) => {
  makeCall('requestJoinURL', {
    breakoutId,
  });
};

const transferUserToMeeting = (fromMeetingId, toMeetingId) => makeCall('transferUser', fromMeetingId, toMeetingId);

const transferToBreakout = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter(breakout => breakout.breakoutId === breakoutId).shift();
  const breakoutMeeting = Meetings.findOne({
    $and: [
      { 'breakoutProps.sequence': breakoutRoom.sequence },
      { 'breakoutProps.parentId': breakoutRoom.parentMeetingId },
      { 'meetingProp.isBreakout': true },
    ],
  }, { fields: { meetingId: 1 } });
  transferUserToMeeting(Auth.meetingID, breakoutMeeting.meetingId);
};

const amIModerator = () => {
  const User = Users.findOne({ intId: Auth.userID }, { fields: { role: 1 } });
  return User.role === ROLE_MODERATOR;
};

const getBreakoutByUserId = userId => Breakouts.find(
  { 'users.userId': userId },
  { fields: { timeRemaining: 0 } },
).fetch();

const getBreakoutByUser = user => Breakouts.findOne({ users: user });

const getUsersFromBreakouts = breakoutsArray => breakoutsArray
  .map(breakout => breakout.users)
  .reduce((acc, usersArray) => [...acc, ...usersArray], []);

const filterUserURLs = userId => breakoutUsersArray => breakoutUsersArray
  .filter(user => user.userId === userId);

const getLastURLInserted = breakoutURLArray => breakoutURLArray
  .sort((a, b) => a.insertedTime - b.insertedTime).pop();

const getBreakoutUserByUserId = userId => fp.pipe(
  getBreakoutByUserId,
  getUsersFromBreakouts,
  filterUserURLs(userId),
  getLastURLInserted,
)(userId);

const getBreakouts = () => Breakouts.find({}, { sort: { sequence: 1 } }).fetch();
const getBreakoutsNoTime = () => Breakouts.find(
  {},
  {
    sort: { sequence: 1 },
    fields: { timeRemaining: 0 },
  },
).fetch();

const getBreakoutUserIsIn = userId => Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${userId}`) }, { fields: { sequence: 1 } });

const isUserInBreakoutRoom = (joinedUsers) => {
  const userId = Auth.userID;

  return !!joinedUsers.find(user => user.userId.startsWith(userId));
};

export default {
  findBreakouts,
  endAllBreakouts,
  requestJoinURL,
  breakoutRoomUser,
  transferUserToMeeting,
  transferToBreakout,
  meetingId: () => Auth.meetingID,
  closeBreakoutPanel,
  amIModerator,
  getBreakoutUserByUserId,
  getBreakoutByUser,
  getBreakouts,
  getBreakoutsNoTime,
  getBreakoutByUserId,
  getBreakoutUserIsIn,
  isUserInBreakoutRoom,
};
