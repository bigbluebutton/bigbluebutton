import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import GroupChat from '/imports/api/group-chat';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

export default function chatMessageBeforeJoinCounter() {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const groupChats = GroupChat.find({
      $or: [
        { meetingId, access: PUBLIC_CHAT_TYPE },
        { meetingId, users: { $all: [requesterUserId] } },
      ],
    }).fetch();

    const User = Users.findOne({ userId: requesterUserId, meetingId });

    const chatIdWithCounter = groupChats.map((groupChat) => {
      const msgCount = GroupChatMsg.find({
        meetingId,
        chatId: groupChat.chatId,
        timestamp: { $lt: User.authTokenValidatedTime },
      }).count();
      return {
        chatId: groupChat.chatId,
        count: msgCount,
      };
    }).filter((chat) => chat.count);
    return chatIdWithCounter;
  } catch (err) {
    Logger.error(`Exception while invoking method chatMessageBeforeJoinCounter ${err.stack}`);
  }
}
