import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import { redisConfig } from '/config';

Meteor.methods({
  userSetEmoji(credentials, toRaiseUserId, status) {
    const { meetingId, requesterUserId, requesterToken } = credentials;
    let message;
    if (isAllowedTo('setEmojiStatus', credentials)) {
      message = {
        payload: {
          emoji_status: status,
          userid: toRaiseUserId,
          meeting_id: meetingId,
        },
      };

      message = appendMessageHeader('user_emoji_status_message', message);

      // publish to pubsub
      publish(redisConfig.channels.toBBBApps.users, message);
    }
  },
});
