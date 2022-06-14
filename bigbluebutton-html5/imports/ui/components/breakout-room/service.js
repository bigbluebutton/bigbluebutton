import Breakouts from '/imports/api/breakouts';
import Meetings, { MeetingTimeRemaining } from '/imports/api/meetings';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import UserListService from '/imports/ui/components/user-list/service';
import fp from 'lodash/fp';
import UsersPersistentData from '/imports/api/users-persistent-data';
import BreakoutsHistory from '/imports/api/breakouts-history';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const findBreakouts = () => {
  const BreakoutRooms = Breakouts.find(
    {
      parentMeetingId: Auth.meetingID,
    },
    {
      sort: {
        sequence: 1,
      },
    }
  ).fetch();

  return BreakoutRooms;
};

const getBreakoutRoomUrl = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms
    .filter((breakout) => breakout.breakoutId === breakoutId)
    .shift();
  const breakoutUrlData =
    breakoutRoom && breakoutRoom[`url_${Auth.userID}`]
      ? breakoutRoom[`url_${Auth.userID}`]
      : null;
  return breakoutUrlData;
};

const endAllBreakouts = () => {
  makeCall('endAllBreakouts');
};

const requestJoinURL = (breakoutId) => {
  makeCall('requestJoinURL', {
    breakoutId,
  });
};

const isNewTimeHigherThanMeetingRemaining = (newTimeInMinutes) => {
  const meetingId = Auth.meetingID;
  const meetingTimeRemaining = MeetingTimeRemaining.findOne({ meetingId });

  if (meetingTimeRemaining) {
    const { timeRemaining } = meetingTimeRemaining;

    if (timeRemaining) {
      const newBreakoutRoomsRemainingTime = newTimeInMinutes * 60;
      //  Keep margin of 5 seconds for breakout rooms end before parent meeting
      const meetingTimeRemainingWithMargin = timeRemaining - 5;

      if (newBreakoutRoomsRemainingTime > meetingTimeRemainingWithMargin) {
        return true;
      }
    }
  }

  return false;
};

const setBreakoutsTime = (timeInMinutes) => {
  if (timeInMinutes <= 0) return false;

  makeCall('setBreakoutsTime', {
    timeInMinutes,
  });

  return true;
};

const sendMessageToAllBreakouts = (msg) => {
  makeCall('sendMessageToAllBreakouts', {
    msg,
  });

  return true;
};

const getUserMessagesToAllBreakouts = () => {
  const breakoutHistory = BreakoutsHistory.findOne(
    { meetingId: Auth.meetingID },
    { fields: { broadcastMsgs: 1 } },
  ) || {};

  return (breakoutHistory.broadcastMsgs || []).filter((msg) => msg.senderId === Auth.userID);
};

const transferUserToMeeting = (fromMeetingId, toMeetingId) =>
  makeCall('transferUser', fromMeetingId, toMeetingId);

const transferToBreakout = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms
    .filter((breakout) => breakout.breakoutId === breakoutId)
    .shift();
  const breakoutMeeting = Meetings.findOne(
    {
      $and: [
        { 'breakoutProps.sequence': breakoutRoom.sequence },
        { 'breakoutProps.parentId': breakoutRoom.parentMeetingId },
        { 'meetingProp.isBreakout': true },
      ],
    },
    { fields: { meetingId: 1 } }
  );
  transferUserToMeeting(Auth.meetingID, breakoutMeeting.meetingId);
};

const amIModerator = () => {
  const User = Users.findOne({ intId: Auth.userID }, { fields: { role: 1 } });
  return User.role === ROLE_MODERATOR;
};

const checkInviteModerators = () => {
  const BREAKOUTS_CONFIG = Meteor.settings.public.app.breakouts;

  return !(
    amIModerator() && !BREAKOUTS_CONFIG.sendInvitationToIncludedModerators
  );
};

const getBreakoutByUserId = (userId) =>
  Breakouts.find(
    { [`url_${userId}`]: { $exists: true } },
    { fields: { timeRemaining: 0 } }
  ).fetch();

const getBreakoutByUrlData = (breakoutUrlData) =>
  Breakouts.findOne({ [`url_${Auth.userID}`]: breakoutUrlData });

const getUrlFromBreakouts = (userId) => (breakoutsArray) =>
  breakoutsArray
    .map((breakout) => breakout[`url_${userId}`])
    .reduce((acc, urlDataArray) => acc.concat(urlDataArray), []);

const getLastURLInserted = (breakoutURLArray) =>
  breakoutURLArray.sort((a, b) => a.insertedTime - b.insertedTime).pop();

const getBreakoutUrlByUserId = (userId) =>
  fp.pipe(
    getBreakoutByUserId,
    getUrlFromBreakouts(userId),
    getLastURLInserted
  )(userId);

const getBreakouts = () =>
  Breakouts.find({}, { sort: { sequence: 1 } }).fetch();
const getBreakoutsNoTime = () =>
  Breakouts.find(
    {},
    {
      sort: { sequence: 1 },
      fields: { timeRemaining: 0 },
    }
  ).fetch();

const getBreakoutUserIsIn = (userId) =>
  Breakouts.findOne(
    { 'joinedUsers.userId': new RegExp(`^${userId}`) },
    { fields: { sequence: 1 } }
  );

const getBreakoutUserWasIn = (userId, extId) => {
  const selector = {
    meetingId: Auth.meetingID,
    lastBreakoutRoom: { $exists: 1 },
  };

  if (extId !== null) {
    selector.extId = extId;
  } else {
    selector.userId = userId;
  }

  const users = UsersPersistentData.find(
    selector,
    { fields: { userId: 1, lastBreakoutRoom: 1 } },
  ).fetch();

  if (users.length > 0) {
    const hasCurrUserId = users.filter((user) => user.userId === userId);
    if (hasCurrUserId.length > 0) return hasCurrUserId.pop().lastBreakoutRoom;

    return users.pop().lastBreakoutRoom;
  }

  return null;
};

const isUserInBreakoutRoom = (joinedUsers) => {
  const userId = Auth.userID;

  return !!joinedUsers.find((user) => user.userId.startsWith(userId));
};

export default {
  findBreakouts,
  endAllBreakouts,
  setBreakoutsTime,
  sendMessageToAllBreakouts,
  getUserMessagesToAllBreakouts,
  isNewTimeHigherThanMeetingRemaining,
  requestJoinURL,
  getBreakoutRoomUrl,
  transferUserToMeeting,
  transferToBreakout,
  meetingId: () => Auth.meetingID,
  amIModerator,
  getBreakoutUrlByUserId,
  getBreakoutByUrlData,
  getBreakouts,
  getBreakoutsNoTime,
  getBreakoutUserIsIn,
  getBreakoutUserWasIn,
  sortUsersByName: UserListService.sortUsersByName,
  isUserInBreakoutRoom,
  checkInviteModerators,
};
