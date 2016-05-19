import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

export function createDummyUser(meetingId, userId, authToken) {
  if (Users.findOne({
    userId: userId,
    meetingId: meetingId,
    authToken: authToken,
  }) != null) {
    const msg = `html5 user userId:[${userId}] from [${meetingId}] tried to revalidate token`;
    return logger.info(msg);
  } else {
    return Users.insert({
      meetingId: meetingId,
      userId: userId,
      authToken: authToken,
      clientType: 'HTML5',
      validated: false, //will be validated on validate_auth_token_reply
    }, (err, id) => {
      const res = Users.find({ meetingId: meetingId, }).count();
      return logger.info(`_added a dummy html5 user userId=[${userId}] Users.size is now ${res}`);
    });
  }
};
