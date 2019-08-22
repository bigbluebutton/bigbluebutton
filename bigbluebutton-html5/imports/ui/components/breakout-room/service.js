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

const isPresenter = () => {
  const User = Users.findOne({ intId: Auth.userID }, { fields: { presenter: 1 } });
  return User.presenter;
};

const isModerator = () => {
  const User = Users.findOne({ intId: Auth.userID }, { fields: { role: 1 } });
  return User.role === ROLE_MODERATOR;
};

const getUsersByBreakoutId = breakoutId => Users.find({
  meetingId: breakoutId,
  connectionStatus: 'online',
}, { fields: {} });

const getBreakoutByUserId = userId => Breakouts.find({ 'users.userId': userId }).fetch();

const getBreakoutByUser = user => Breakouts.findOne({ users: user }, { fields: { breakoutId: 1 } });

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

export default {
  findBreakouts,
  endAllBreakouts,
  requestJoinURL,
  breakoutRoomUser,
  transferUserToMeeting,
  transferToBreakout,
  meetingId: () => Auth.meetingID,
  isPresenter,
  closeBreakoutPanel,
  isModerator,
  getUsersByBreakoutId,
  getBreakoutUserByUserId,
  getBreakoutByUser,
  getBreakouts,
  getBreakoutByUserId,
};
