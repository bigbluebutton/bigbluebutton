import GroupChat from '/imports/api/group-chat';
import { Meteor } from 'meteor/meteor';

import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function groupChat() {
  if (!this.userId) {
    return GroupChat.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

  Logger.debug('Publishing group-chat', { meetingId, requesterUserId });

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
