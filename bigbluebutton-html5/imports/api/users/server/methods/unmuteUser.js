import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import { updateVoiceUser } from '/imports/api/users/server/modifiers/updateVoiceUser';
import { logger } from '/imports/startup/server/logger';

Meteor.methods({
  // meetingId: the meetingId of the meeting the user[s] is in
  // toMuteUserId: the userId of the user to be unmuted
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  unmuteUser(credentials, toMuteUserId) {
    const REDIS_CONFIG = Meteor.settings.redis;
    const { meetingId, requesterUserId, requesterToken } = credentials;
    const action = function () {
      if (toMuteUserId === requesterUserId) {
        return 'unmuteSelf';
      } else {
        return 'unmuteOther';
      }
    };

    if (isAllowedTo(action(), credentials)) {
      let message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: false,
          requester_id: requesterUserId,
        },
      };
      message = appendMessageHeader('mute_user_request_message', message);
      logger.info(`publishing a user unmute request for ${toMuteUserId}`);
      publish(REDIS_CONFIG.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        web_userid: toMuteUserId,
        talking: false,
        muted: false,
      });
    }
  },
});
