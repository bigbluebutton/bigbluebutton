import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';
import { createDummyUser } from '/imports/api/users/server/users';
import { publish } from '/imports/startup/server/helpers';

Meteor.methods({
  // Construct and send a message to bbb-web to validate the user
  validateAuthToken(meetingId, userId, authToken) {
    let message;
    logger.info('sending a validate_auth_token with', {
      userid: userId,
      authToken: authToken,
      meetingid: meetingId,
    });
    message = {
      payload: {
        auth_token: authToken,
        userid: userId,
        meeting_id: meetingId,
      },
      header: {
        timestamp: new Date().getTime(),
        reply_to: `${meetingId}/${userId}`,
        name: 'validate_auth_token',
      },
    };
    if ((authToken != null) && (userId != null) && (meetingId != null)) {
      createDummyUser(meetingId, userId, authToken);
      return publish(redisConfig.channels.toBBBApps.meeting, message);
    } else {
      return logger.info('did not have enough information to send a validate_auth_token message');
    }
  },
});

