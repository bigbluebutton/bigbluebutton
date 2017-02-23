import { logger } from '/imports/startup/server/logger';
import { eventEmitter } from '/imports/startup/server';
import { userJoined } from './userJoined';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import Users from '../..';

eventEmitter.on('validate_auth_token_reply', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const userId = arg.payload.userid;
  const user = Users.findOne({
    userId: userId,
    meetingId: meetingId,
  });
  const validStatus = arg.payload.valid;

  // if the user already exists in the db
  if (user != null && user.clientType === 'HTML5') {
    //if the html5 client user was validated successfully, add a flag
    return Users.update({
      userId: userId,
      meetingId: meetingId,
    }, {
      $set: {
        validated: validStatus,
      },
    }, (err, numChanged) => {
      if (numChanged.insertedId != null) {
        let funct = function (cbk) {
          let user = Users.findOne({
            userId: userId,
            meetingId: meetingId,
          });
          let val;
          if (user != null) {
            val = user.validated;
          }

          logger.info(`user.validated for ${userId} in meeting ${meetingId} just became ${val}`);
          return cbk();
        };

        return funct(arg.callback);
      } else {
        return arg.callback();
      }
    });
  } else {
    logger.info('a non-html5 user got validate_auth_token_reply.');
    return arg.callback();
  }
});

eventEmitter.on('user_joined_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const payload = arg.payload;
  let userObj = payload.user;
  let dbUser = Users.findOne({
    userId: userObj.userid,
    meetingId: meetingId,
  });

  // On attempting reconnection of Flash clients (in voiceBridge) we receive
  // an extra user_joined_message. Ignore it as it will add an extra user
  // in the user list, creating discrepancy with the list in the Flash client
  if (dbUser != null && dbUser.user != null && dbUser.user.connection_status === 'offline') {
    if (payload.user != null && payload.user.phone_user) {
      logger.error('offline AND phone user');
      return arg.callback(); //return without joining the user
    }
  } else {
    if (dbUser != null && dbUser.clientType === 'HTML5') {
      // typically html5 users will be in
      // the db [as a dummy user] before the joining message
      let status = dbUser.validated;
      logger.info(`in user_joined_message the validStatus of the user was ${status}`);
      userObj.timeOfJoining = arg.header.current_time;
    }

    return userJoined(meetingId, userObj, arg.callback);
  }

  return arg.callback();
});
