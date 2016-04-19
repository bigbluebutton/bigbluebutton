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
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  }
});
