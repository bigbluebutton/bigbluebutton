Meteor.methods({
  userSetEmoji(meetingId, toRaiseUserId, raisedByUserId, raisedByToken, status) {
    let message;
    if (isAllowedTo('setEmojiStatus', meetingId, raisedByUserId, raisedByToken)) {
      message = {
        payload: {
          emoji_status: status,
          userid: toRaiseUserId,
          meeting_id: meetingId,
        },
        header: {
          timestamp: new Date().getTime(),
          name: 'user_emoji_status_message',
          version: '0.0.1',
        },
      };

      // publish to pubsub
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  }
});
