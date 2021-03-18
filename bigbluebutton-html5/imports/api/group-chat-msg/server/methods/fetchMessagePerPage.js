import { Meteor } from 'meteor/meteor';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

const CHAT_CONFIG = Meteor.settings.public.chat;
const ITENS_PER_PAGE = CHAT_CONFIG.itemsPerPage;

export default function fetchMessagePerPage(chatId, page) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const User = Users.findOne({ userId: requesterUserId, meetingId });

  const messages = GroupChatMsg.find({ chatId, meetingId, timestamp: { $lt: User.authTokenValidatedTime } },
    {
      sort: { timestamp: 1 },
      skip: page > 0 ? ((page - 1) * ITENS_PER_PAGE) : 0,
      limit: ITENS_PER_PAGE,
    })
    .fetch();
  return messages;
}
