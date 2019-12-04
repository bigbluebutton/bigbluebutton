import GroupChat from '/imports/api/group-chat';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Logger from '/imports/startup/server/logger';

function groupChat(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

  Logger.debug(`Publishing group-chat for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return GroupChat.find({
    $or: [
      { meetingId, access: PUBLIC_CHAT_TYPE },
      { meetingId, users: { $all: [requesterUserId] } },
    ],

  });
}

function publish(...args) {
  const boundGroupChat = groupChat.bind(this);
  return boundGroupChat(...args);
}

Meteor.publish('group-chat', publish);
