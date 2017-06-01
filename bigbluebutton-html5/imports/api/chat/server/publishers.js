import Chat from '/imports/api/chat';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('chat', function() {
  chat = chat.bind(this);
  return mapToAcl('chat', chat)(arguments);
});

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
};
