import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import Users from '/imports/api/users';
import UserListService from '/imports/ui/components/user-list/service';
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

const getBreakoutRoomUrl = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter((breakout) => breakout.breakoutId === breakoutId).shift();
  const breakoutUrlData = (breakoutRoom && breakoutRoom[`url_${Auth.userID}`]) ? breakoutRoom[`url_${Auth.userID}`] : null;
  return breakoutUrlData;
};

const closeBreakoutPanel = () => {
  Session.set('openPanel', 'userlist');
  window.dispatchEvent(new Event('panelChanged'));
};

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
  const breakoutRoom = breakoutRooms.filter((breakout) => breakout.breakoutId === breakoutId).shift();
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

const checkInviteModerators = () => {
  const BREAKOUTS_CONFIG = Meteor.settings.public.app.breakouts;

  return !((amIModerator() && !BREAKOUTS_CONFIG.sendInvitationToIncludedModerators));
};

const getBreakoutByUserId = (userId) => Breakouts.find(
  { [`url_${userId}`]: { $exists: true } },
  { fields: { timeRemaining: 0 } },
).fetch();

const getBreakoutByUrlData = (breakoutUrlData) => Breakouts.findOne({ [`url_${Auth.userID}`]: breakoutUrlData });

const getUrlFromBreakouts = (userId) => (breakoutsArray) => breakoutsArray
  .map((breakout) => breakout[`url_${userId}`])
  .reduce((acc, urlDataArray) => acc.concat(urlDataArray), []);

const getLastURLInserted = (breakoutURLArray) => breakoutURLArray
  .sort((a, b) => a.insertedTime - b.insertedTime).pop();

const getBreakoutUrlByUserId = (userId) => fp.pipe(
  getBreakoutByUserId,
  getUrlFromBreakouts(userId),
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

const getBreakoutUserIsIn = (userId) => Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${userId}`) }, { fields: { sequence: 1 } });

const isUserInBreakoutRoom = (joinedUsers) => {
  const userId = Auth.userID;

  return !!joinedUsers.find((user) => user.userId.startsWith(userId));
};

export default {
  findBreakouts,
  endAllBreakouts,
  requestJoinURL,
  getBreakoutRoomUrl,
  transferUserToMeeting,
  transferToBreakout,
  meetingId: () => Auth.meetingID,
  closeBreakoutPanel,
  amIModerator,
  getBreakoutUrlByUserId,
  getBreakoutByUrlData,
  getBreakouts,
  getBreakoutsNoTime,
  getBreakoutUserIsIn,
  sortUsersByName: UserListService.sortUsersByName,
  isUserInBreakoutRoom,
  checkInviteModerators,
};
