import Chat from '/imports/api/chat';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function chat(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_USERNAME = CHAT_CONFIG.public_username;

  Logger.info(`Publishing chat for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Chat.find({
    $or: [
      {
        toUsername: PUBLIC_CHAT_USERNAME,
        meetingId,
      }, {
        fromUserId: requesterUserId,
        meetingId,
      }, {
        toUserId: requesterUserId,
        meetingId,
      },
    ],
  });
}

function publish(...args) {
  const boundChat = chat.bind(this);
  return mapToAcl('subscriptions.chat', boundChat)(args);
}

Meteor.publish('chat', publish);
