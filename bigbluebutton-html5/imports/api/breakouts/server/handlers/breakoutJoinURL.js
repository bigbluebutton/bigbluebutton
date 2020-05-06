import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/breakouts';

export default function handleBreakoutJoinURL({ body }) {
  const {
    redirectToHtml5JoinURL,
    userId,
    username,
    email, 
    breakoutId,
  } = body;

  check(redirectToHtml5JoinURL, String);

  const selector = {
    breakoutId
  };

  const breakoutRoom = Breakouts.findOne({
    breakoutId: breakoutId    
  });

  const usersMapped = breakoutRoom.users.filter(user => user.email != email)
  .map(u =>  ({userId: u.userId, username: u.username, email: u.email, redirectToHtml5JoinURL: u.redirectToHtml5JoinURL, 
              insertedTime: u.insertedTime}))

  usersMapped.push({userId: userId, username: username, email: email, redirectToHtml5JoinURL: redirectToHtml5JoinURL, 
           insertedTime: new Date().getTime()})

  modifier = {
    $set: {
      users: usersMapped
    }
  };

 
  const cb = (err) => {
    if (err) {
      return Logger.error(`updating users in breakout with new invite: ${err}`);
    }

    return Logger.info('Updated users '
      + `in breakout id=${breakoutId}`);
  };

  Breakouts.update(selector, modifier, cb);

}
