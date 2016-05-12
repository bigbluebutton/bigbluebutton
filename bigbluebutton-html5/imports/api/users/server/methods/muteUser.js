import { publish } from '/imports/startup/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/startup/server/helpers';
import { updateVoiceUser } from '/imports/api/users/server/modifiers/clearUsersCollection';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

Meteor.methods({
  // meetingId: the meetingId of the meeting the user[s] is in
  // toMuteUserId: the userId of the user to be muted
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  muteUser(meetingId, toMuteUserId, requesterUserId, requesterToken) {
    let action, message;
    action = function () {
      if (toMuteUserId === requesterUserId) {
        return 'muteSelf';
      } else {
        return 'muteOther';
      }
    };

    if (isAllowedTo(action(), meetingId, requesterUserId, requesterToken)) {
      message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: true,
          requester_id: requesterUserId,
        },
      };
      message = appendMessageHeader('mute_user_request_message', message);
      logger.info(`publishing a user mute request for ${toMuteUserId}`);
      publish(redisConfig.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        web_userid: toMuteUserId,
        talking: false,
        muted: true,
      });
    }
  },
});
