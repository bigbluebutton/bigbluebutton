import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import { logger } from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';

export default function getStun(credentials) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const { meetingId, requesterUserId } = credentials;
  const eventName = 'send_stun_turn_info_request_message';

  let message = {
    payload: {
      meeting_id: meetingId,
      requester_id: requesterUserId,
    },
  };

  message = appendMessageHeader(eventName, message);
  return publish(REDIS_CONFIG.channels.fromBBBUsers, message);
};
