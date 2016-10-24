import Chat from '/imports/api/chat';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

Meteor.publish('chat', (credentials) => {
  if (!isAllowedTo('subscribeChat', credentials)) {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'chats'"));
  }

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing chat for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Chat.find({
    $or: [
      {
        'message.chat_type': PUBLIC_CHAT_TYPE,
        meetingId,
      }, {
        'message.from_userid': requesterUserId,
        meetingId,
      }, {
        'message.to_userid': requesterUserId,
        meetingId,
      },
    ],
  });
});
