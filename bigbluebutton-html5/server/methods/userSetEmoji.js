import { publish } from '/server/redispubsub';
import { isAllowedTo } from '/server/user_permissions';
import { appendMessageHeader } from '/server/helpers';
import { redisConfig } from '/config';

Meteor.methods({
  userSetEmoji(meetingId, toRaiseUserId, raisedByUserId, raisedByToken, status) {
    let message;
    if (isAllowedTo('setEmojiStatus', meetingId, raisedByUserId, raisedByToken)) {
      message = {
        payload: {
          emoji_status: status,
          userid: toRaiseUserId,
          meeting_id: meetingId,
        }
      };

      message = appendMessageHeader('user_emoji_status_message', message);
      // publish to pubsub
      publish(redisConfig.channels.toBBBApps.users, message);
    }
  }
});
