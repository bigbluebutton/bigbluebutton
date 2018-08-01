import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

import { GroupChat, CHAT_ACCESS_PUBLIC } from '/imports/api/group-chat-msg';

function groupChatMsg(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing group-chat-msg for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return GroupChat.find({
    $or: [
      {
        access: CHAT_ACCESS_PUBLIC,
        meetingId,
      }, {
        users: { $in: [requesterUserId] },
        meetingId,
      },
    ],
  });
}

function publish(...args) {
  const boundGroupChat = groupChatMsg.bind(this);
  return mapToAcl('subscriptions.group-chat-msg', boundGroupChat)(args);
}

Meteor.publish('group-chat-msg', publish);
