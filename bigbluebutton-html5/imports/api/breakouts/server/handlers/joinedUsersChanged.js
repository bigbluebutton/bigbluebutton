import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function joinedUsersChanged({ body }) {
  check(body, Object);

  const {
    parentId,
    breakoutId,
    joinedUsers,
    ejectedUsers,
  } = body;

  check(parentId, String);
  check(breakoutId, String);
  check(joinedUsers, Array);
  check(ejectedUsers, Array);

  console.log(`joinedUsers.length${joinedUsers.length}`);
  console.log(`ejectedUsers.length${ejectedUsers.length}`);

  const breakoutRoom = Breakouts.findOne({
    breakoutId: breakoutId,
    parentMeetingId: parentId
  });

  const usersMapped = breakoutRoom.users.filter(user => { 
    let r = ejectedUsers.filter(e => e.id === user.userId).shift();
    return (r == null || r == undefined);
  })
  .map(u =>  ({userId: u.userId, userName: u.userName, redirectToHtml5JoinURL: u.redirectToHtml5JoinURL, 
              insertedTime: u.insertedTime}))

 
  const selector = {
    parentMeetingId: parentId,
    breakoutId,
  };
  const joinedUsersMapped = joinedUsers.map(user => ({ userId: user.id, name: user.name }));

  let modifier = '';
  if (ejectedUsers.length > 0) {
    modifier = {
      $set: {
        joinedUsers: joinedUsersMapped,
        users: usersMapped
      },

    };
  } else {
    modifier = {
      $set: {
        joinedUsers: joinedUsersMapped,
      },
    };
  }


  const cb = (err) => {
    if (err) {
      return Logger.error(`updating joined users in breakout: ${err}`);
    }

    return Logger.info('Updated joined users '
      + `in breakout id=${breakoutId}`);
  };

  Breakouts.find(selector);
  Breakouts.update(selector, modifier, cb);
}
