import Chat from '/imports/api/chat/collection';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('chat', function (meetingId, userid, authToken) {
  if (isAllowedTo('subscribeChat', meetingId, userid, authToken)) {
    logger.info(`publishing chat for ${meetingId} ${userid} ${authToken}`);
    return Chat.find({
      $or: [
        {
          'message.chat_type': 'PUBLIC_CHAT',
          meetingId: meetingId,
        }, {
          'message.from_userid': userid,
          meetingId: meetingId,
        }, {
          'message.to_userid': userid,
          meetingId: meetingId,
        },
      ],
    });
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'chats'"));
  }
});
