import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { requestUserLeaving } from '/imports/api/users/server/modifiers/requestUserLeaving';
import { logger } from '/imports/startup/server/logger';

Meteor.methods({
  userLogout(credentials) {
    if (isAllowedTo('logoutSelf', credentials)) {
      const { meetingId, requesterUserId, requesterToken } = credentials;
      logger.info(`a user is logging out from ${meetingId}:${requesterUserId}`);
      return requestUserLeaving(meetingId, requesterUserId);
    }
  },
});
