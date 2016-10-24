import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import Polls from '/imports/api/polls';
import { logger } from '/imports/startup/server/logger';

Meteor.methods({
  getStun(credentials) { //TODO discuss location
    const REDIS_CONFIG = Meteor.settings.redis;
    // if (isAllowedTo('subscribePoll', credentials)) {
      const { meetingId, requesterUserId, requesterToken } = credentials;
      const eventName = 'send_stun_turn_info_request_message';

      // if ((meetingId != null) &&
      //   (result.meetingId != null) &&
      //   (requesterUserId != null) &&
      //   (pollAnswerId != null)) {
        let message = {
          payload: {
            meeting_id: meetingId,
            requester_id: requesterUserId,
          },
        };

        message = appendMessageHeader(eventName, message);
        console.log('\n get stun \n');
        return publish(REDIS_CONFIG.channels.fromBBBApps, message);
      // }
    // }
  },
});
