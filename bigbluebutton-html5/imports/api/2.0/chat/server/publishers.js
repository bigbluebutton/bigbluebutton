import Chat from '/imports/api/2.0/chat';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

function chat(credentials) {
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
        'message.chatType': PUBLIC_CHAT_TYPE,
        meetingId,
      }, {
        'message.fromUserid': requesterUserId,
        meetingId,
      }, {
        'message.toUserid': requesterUserId,
        meetingId,
      },
    ],
  });
}

function publish(...args) {
  const boundChat = chat.bind(this);
  return mapToAcl('subscriptions.chat', boundChat)(args);
}

Meteor.publish('chat2x', publish);
