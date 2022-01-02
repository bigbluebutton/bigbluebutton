import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function updateRandomUser(meetingId, userIds, choice, requesterId) {
  check(meetingId, String);
  check(userIds, Array);
  check(choice, String);
  check(requesterId, String);

  const selector = {
    meetingId,
  };

  const userList = [];
  if (choice == "") { // no viewer
    userList.push([requesterId,0]);
  } else if (userIds.length == 1) {
    userList.push([userIds[0],0]);
  } else {
    const intervals = [0, 200, 450, 750, 1100, 1500];
    while (intervals.length > 0) {
      const userId = userIds[Math.floor(Math.random() * userIds.length )];
      if (userList.length != 0 && userList[userList.length-1][0] == userId) {// prevent same viewer from being selected sequentially
        continue;
      }
      userList.push([userId, intervals.shift()]);
    }
    userList[userList.length-1][0] = choice; // last one should be chosen in akka-app
  }

  if (userIds.length == 2) {
    // I don't like this.. When the userList is same as previous one, we need to change it a bit to make sure that clients does not skip the change in MongoDB
    const previousMeeting = Meetings.findOne(selector, { fields: {randomlySelectedUser:1}});
    if (previousMeeting.randomlySelectedUser.length != 0 && userList[0][0] == previousMeeting.randomlySelectedUser[0][0]) {
      userList[0][0] = userList[1][0];
    }
  }

  const modifier = {
    $set: {
      randomlySelectedUser: userList,
    },
  };

  try {
    const { insertedId } = Meetings.upsert(selector, modifier);
    if (insertedId) {
      Logger.info(`Set randomly selected userId and interval = ${userList} by requesterId=${requesterId} in meeitingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting randomly selected userId and interval = ${userList} by requesterId=${requesterId} in meetingId=${meetingId}`);
  }
}
