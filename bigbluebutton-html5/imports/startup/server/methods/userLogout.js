import { isAllowedTo } from '/imports/startup/server/user_permissions';
import { requestUserLeaving } from '/imports/startup/server/collection_methods/users';
import { logger } from '/imports/startup/server/logger';

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
