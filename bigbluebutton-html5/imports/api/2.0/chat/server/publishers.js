import Chat from '/imports/api/2.0/chat';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

function chat(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing chat for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Chat.find({
    $or: [
      {
        'message.toUsername': 'public_chat_username',
        meetingId,
      }, {
        'message.fromUserId': requesterUserId,
        meetingId,
      }, {
        'message.toUserId': requesterUserId,
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
