import Chat from '/imports/api/chat';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('chat', function (credentials) {
  if (isAllowedTo('subscribeChat', credentials)) {
    const { meetingId, requesterUserId, requesterToken } = credentials;
    logger.info(`publishing chat for ${meetingId} ${requesterUserId} ${requesterToken}`);
    return Chat.find({
      $or: [
        {
          'message.chat_type': 'PUBLIC_CHAT',
          meetingId: meetingId,
        }, {
          'message.from_userid': requesterUserId,
          meetingId: meetingId,
        }, {
          'message.to_userid': requesterUserId,
          meetingId: meetingId,
        },
      ],
    });
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'chats'"));
  }
});
