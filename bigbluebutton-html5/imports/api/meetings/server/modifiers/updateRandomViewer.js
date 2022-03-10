import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

const SELECT_RANDOM_USER_COUNTDOWN = Meteor.settings.public.selectRandomUser.countdown;

//  Time intervals in milliseconds
//  for iteration in animation.
let intervals = [0, 200, 450, 750, 1100, 1500];

//  Used to togle to the first value of intervals to
//  differenciare whether this function has been called
let updateIndicator = true;

//  A finction that toggles
//  the first interval on each call
function toggleIndicator() {
  if (updateIndicator) {
    intervals[0] = 1;
  } else {
    intervals[0] = 0;
  }
  updateIndicator = !updateIndicator;
}

function getFiveRandom(userList, userIds) {
  let IDs = userIds.slice();
  for (let i = 0; i < intervals.length - 1; i++) {
    if (IDs.length === 0) { // we used up all the options
      IDs = userIds.slice(); // start over
      let userId = IDs.splice(0, 1);
      if (userList[userList.length] === [userId, intervals[i]]) { // If we start over with the one we finnished, change it
        IDs.push(userId);
        userId = IDs.splice(0, 1);
      }
      userList.push([userId, intervals[i]]);
    } else {
      const userId = IDs.splice(Math.floor(Math.random() * IDs.length), 1);
      userList.push([userId, intervals[i]]);
    }
  }
}

//  All possible combinations of 3 elements
//  to speed up randomizing
const optionsFor3 = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 2, 0],
  [1, 0, 2],
  [2, 0, 1],
  [2, 1, 0],
];

export default function updateRandomUser(meetingId, userIds, choice, requesterId) {
  check(meetingId, String);
  check(userIds, Array);
  check(choice, String);
  check(requesterId, String);

  let userList = [];

  const selector = {
    meetingId,
  };

  toggleIndicator();

  const numberOfUsers = userIds.length;

  if (choice == "") { // no viewer
    userList = [
      [requesterId, intervals[0]],
      [requesterId, 0],
      [requesterId, 0],
      [requesterId, 0],
      [requesterId, 0],
      [requesterId, 0],
    ];
  } else if (numberOfUsers === 1) { //  If user is only one, obviously it is the chosen one
    userList = [
      [userIds[0], intervals[0]],
      [userIds[0], 0],
      [userIds[0], 0],
      [userIds[0], 0],
      [userIds[0], 0],
      [userIds[0], 0],
    ];
  }

  else if (!SELECT_RANDOM_USER_COUNTDOWN) { //  If animation is disabled, we only care about the chosen one
    userList = [
      [choice, intervals[0]],
      [choice, 0],
      [choice, 0],
      [choice, 0],
      [choice, 0],
      [choice, 0],
    ];
  }

  else if (numberOfUsers === 2) { // If there are only two users, we can just chow them in turns
    const IDs = userIds.slice();
    IDs.splice(choice, 1);
    userList = [
      [IDs[0], intervals[0]],
      [choice, intervals[1]],
      [IDs[0], intervals[2]],
      [choice, intervals[3]],
      [IDs[0], intervals[4]],
      [choice, intervals[5]],
    ];
  } else if (numberOfUsers === 3) { //  If there are 3 users, the number of combinations is small, so we'll use that
    const option = Math.floor(Math.random() * 6);
    const order = optionsFor3[option];
    userList = [
      [userIds[order[0]], intervals[0]],
      [userIds[order[1]], intervals[1]],
      [userIds[order[2]], intervals[2]],
      [userIds[order[0]], intervals[3]],
      [userIds[order[1]], intervals[4]],
      [choice, intervals[5]],
    ];
  }

  else { // We generate 5 users randomly, just for animation, and last one is the chosen one
    getFiveRandom(userList, userIds);
    userList.push([choice, intervals[intervals.length]]);
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
