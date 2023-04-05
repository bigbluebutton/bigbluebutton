import { Meteor } from 'meteor/meteor';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

const CHAT_CONFIG = Meteor.settings.public.chat;
const ITENS_PER_PAGE = CHAT_CONFIG.itemsPerPage;

export default async function fetchMessagePerPage(chatId, page) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(chatId, String);
    check(page, Number);

    const User = await Users.findOneAsync({ userId: requesterUserId, meetingId });

    const messages = await GroupChatMsg.find(
      { chatId, meetingId, timestamp: { $lt: User.authTokenValidatedTime } },
      {
        sort: { timestamp: 1 },
        skip: page > 0 ? ((page - 1) * ITENS_PER_PAGE) : 0,
        limit: ITENS_PER_PAGE,
      },
    )
      .fetchAsync();
    return messages;
  } catch (err) {
    Logger.error(`Exception while invoking method fetchMessagePerPage ${err.stack}`);
  }
  //True returned because the function requires a return.
  return true;
}
