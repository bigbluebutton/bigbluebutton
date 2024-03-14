import Breakouts from '/imports/api/breakouts';
import { MeetingTimeRemaining } from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UserListService from '/imports/ui/components/user-list/service';
import UsersPersistentData from '/imports/api/users-persistent-data';
import { UploadingPresentations } from '/imports/api/presentations';

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

const upsertCapturedContent = (filename, temporaryPresentationId) => {
  UploadingPresentations.upsert({
    temporaryPresentationId,
  }, {
    $set: {
      id: temporaryPresentationId,
      temporaryPresentationId,
      progress: 0,
      filename,
      lastModifiedUploader: false,
      upload: {
        done: false,
        error: false,
      },
      uploadTimestamp: new Date(),
      renderedInToast: false,
    },
  });
};

const setCapturedContentUploading = () => {
  const breakoutRooms = findBreakouts();
  breakoutRooms.forEach((breakout) => {
    const filename = breakout.shortName;
    const temporaryPresentationId = breakout.breakoutId;

    if (breakout.captureNotes) {
      upsertCapturedContent(filename, `${temporaryPresentationId}-notes`);
    }

    if (breakout.captureSlides) {
      upsertCapturedContent(filename, `${temporaryPresentationId}-slides`);
    }
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

const getBreakoutByUserId = (userId) =>
  Breakouts.find(
    { [`url_${userId}`]: { $exists: true } },
    { fields: { timeRemaining: 0 } },
  ).fetch();

const getWithBreakoutUrlData = (userId) => (breakoutsArray) => breakoutsArray
  .map((breakout) => {
    if (typeof breakout[`url_${userId}`] === 'object') {
      return Object.assign(breakout, { breakoutUrlData: breakout[`url_${userId}`] });
    }
    return Object.assign(breakout, { breakoutUrlData: { insertedTime: 0 } });
  })
  .reduce((acc, urlDataArray) => acc.concat(urlDataArray), []);

const getLastBreakoutInserted = (breakoutURLArray) => breakoutURLArray.sort((a, b) => {
  return a.breakoutUrlData.insertedTime - b.breakoutUrlData.insertedTime;
}).pop();

const getLastBreakoutByUserId = (userId) => {
  const breakout = getBreakoutByUserId(userId);
  const url = getWithBreakoutUrlData(userId)(breakout);
  return getLastBreakoutInserted(url);
}

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
  isNewTimeHigherThanMeetingRemaining,
  getBreakoutRoomUrl,
  meetingId: () => Auth.meetingID,
  getLastBreakoutByUserId,
  getBreakouts,
  getBreakoutsNoTime,
  getBreakoutUserIsIn,
  getBreakoutUserWasIn,
  sortUsersByName: UserListService.sortUsersByName,
  isUserInBreakoutRoom,
  setCapturedContentUploading,
};
