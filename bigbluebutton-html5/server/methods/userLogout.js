import { isAllowedTo } from '/server/user_permissions';
import { requestUserLeaving } from '/server/collection_methods/users';
import { logger } from '/server/server.js';

Meteor.methods({
  // meetingId: the meeting where the user is
  // userId: the userid of the user logging out
  // authToken: the authToken of the user
  userLogout(meetingId, userId, authToken) {
    if (isAllowedTo('logoutSelf', meetingId, userId, authToken)) {
      logger.info(`a user is logging out from ${meetingId}:${userId}`);
      return requestUserLeaving(meetingId, userId);
    }
  }
});
