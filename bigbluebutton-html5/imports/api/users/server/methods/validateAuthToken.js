import { logger } from '/imports/startup/server/logger';
import { createDummyUser } from '/imports/api/users/server/modifiers/createDummyUser';
import { publish } from '/imports/api/common/server/helpers';

Meteor.methods({
  // Construct and send a message to bbb-web to validate the user
  validateAuthToken(credentials) {
    const REDIS_CONFIG = Meteor.settings.redis;
    const { meetingId, requesterUserId, requesterToken } = credentials;
    logger.info('sending a validate_auth_token with', {
      userid: requesterUserId,
      authToken: requesterToken,
      meetingid: meetingId,
    });
    let message = {
      payload: {
        auth_token: requesterToken,
        userid: requesterUserId,
        meeting_id: meetingId,
      },
      header: {
        timestamp: new Date().getTime(),
        reply_to: `${meetingId}/${requesterUserId}`,
        name: 'validate_auth_token',
      },
    };
    if ((requesterToken != null) && (requesterUserId != null) && (meetingId != null)) {
      createDummyUser(meetingId, requesterUserId, requesterToken);
      return publish(REDIS_CONFIG.channels.toBBBApps.meeting, message);
    } else {
      return logger.info('did not have enough information to send a validate_auth_token message');
    }
  },
});
