import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import GroupChat from '/imports/api/group-chat';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { defineMessages } from 'react-intl';
import PollService from '/imports/ui/components/poll/service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const GROUPING_MESSAGES_WINDOW = CHAT_CONFIG.grouping_messages_window;

const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

const PUBLIC_CHAT_CLEAR = CHAT_CONFIG.chat_clear;
const CHAT_POLL_RESULTS_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_poll_result;

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const ScrollCollection = new Mongo.Collection(null);

const UnsentMessagesCollection = new Mongo.Collection(null);

export const UserSentMessageCollection = new Mongo.Collection(null);

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const intlMessages = defineMessages({
  publicChatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
  pollResult: {
    id: 'app.chat.pollResult',
    description: 'used in place of user name who published poll to chat',
  },
});

const setUserSentMessage = (bool) => {
  UserSentMessageCollection.upsert(
    { userId: Auth.userID },
    { $set: { sent: bool } },
  );
};

const getUser = (userId) => Users.findOne({ userId });

const getPrivateChatByUsers = (userId) => GroupChat
  .findOne({ users: { $all: [userId, Auth.userID] } });

const getWelcomeProp = () => Meetings.findOne({ meetingId: Auth.meetingID },
  { fields: { welcomeProp: 1 } });

const mapGroupMessage = (message) => {
  const mappedMessage = {
    id: message._id || message.id,
    content: message.content,
    time: message.timestamp || message.time,
    sender: null,
    key: message.key,
    chatId: message.chatId
  };

  if (message.sender && message.sender !== SYSTEM_CHAT_TYPE) {
    const sender = Users.findOne(
      { userId: message.sender },
      {
        fields: { avatar: 1, role: 1, name: 1 },
      },
    );

    const mappedSender = {
      avatar: sender?.avatar,
      color: message.color,
      isModerator: sender?.role === ROLE_MODERATOR,
      name: sender.name,
      isOnline: !!sender,
    };

    mappedMessage.sender = mappedSender;
  }

  return mappedMessage;
};

const reduceGroupMessages = (previous, current) => {
  const lastMessage = previous[previous.length - 1];
  const currentMessage = current;
  currentMessage.content = [{
    id: current.id,
    text: current.message,
    time: current.timestamp,
    color: current.color,
  }];
  if (!lastMessage) {
    return previous.concat(currentMessage);
  }
  // Check if the last message is from the same user and time discrepancy
  // between the two messages exceeds window and then group current
  // message with the last one
  const timeOfLastMessage = lastMessage.content[lastMessage.content.length - 1].time;
  const isOrWasPoll = currentMessage.id.includes(CHAT_POLL_RESULTS_MESSAGE)
    || lastMessage.id.includes(CHAT_POLL_RESULTS_MESSAGE);
  const groupingWindow = isOrWasPoll ? 0 : GROUPING_MESSAGES_WINDOW;

  if (lastMessage.sender.id === currentMessage.sender.id
    && (currentMessage.timestamp - timeOfLastMessage) <= groupingWindow) {
    lastMessage.content.push(currentMessage.content.pop());
    return previous;
  }

  return previous.concat(currentMessage);
};

const reduceAndMapGroupMessages = (messages) => (messages
  .reduce(reduceGroupMessages, []).map(mapGroupMessage));

const reduceAndDontMapGroupMessages = (messages) => (messages
  .reduce(reduceGroupMessages, []));

const isChatLocked = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'lockSettingsProps.disablePublicChat': 1, 'lockSettingsProps.disablePrivateChat': 1 } });
  const user = Users.findOne({ meetingId: Auth.meetingID, userId: Auth.userID },
    { fields: { locked: 1, role: 1 } });
  const receiver = Users.findOne({ meetingId: Auth.meetingID, userId: receiverID },
    { fields: { role: 1 } });
  const isReceiverModerator = receiver && receiver.role === ROLE_MODERATOR;

  // disable private chat in breakouts
  if (meetingIsBreakout()) {
    return !isPublic;
  }

  if (meeting.lockSettingsProps !== undefined) {
    if (user.locked && user.role !== ROLE_MODERATOR) {
      if (isPublic) {
        return meeting.lockSettingsProps.disablePublicChat;
      }
      return !isReceiverModerator
        && meeting.lockSettingsProps.disablePrivateChat;
    }
  }

  return false;
};

const lastReadMessageTime = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_GROUP_CHAT_ID : receiverID;

  return UnreadMessages.get(chatType);
};

const sendGroupMessage = (message, idChatOpen) => {
  const chatIdToSent = idChatOpen === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : idChatOpen;
  const chat = GroupChat.findOne({ chatId: chatIdToSent },
    { fields: { users: 1 } });
  const chatID = idChatOpen === PUBLIC_CHAT_ID
    ? PUBLIC_GROUP_CHAT_ID
    : chat.users.filter((id) => id !== Auth.userID)[0];
  const isPublicChat = chatID === PUBLIC_CHAT_ID;

  let destinationChatId = PUBLIC_GROUP_CHAT_ID;

  const { fullname: senderName, userID: senderUserId } = Auth;
  const receiverId = { id: chatID };

  if (!isPublicChat) {
    const privateChat = GroupChat.findOne({ users: { $all: [chatID, senderUserId] } },
      { fields: { chatId: 1 } });

    if (privateChat) {
      const { chatId: privateChatId } = privateChat;

      destinationChatId = privateChatId;
    }
  }

  const userAvatarColor = Users.findOne({ userId: senderUserId }, { fields: { color: 1 } });

  const payload = {
    color: userAvatarColor?.color || '0',
    correlationId: `${senderUserId}-${Date.now()}`,
    sender: {
      id: senderUserId,
      name: senderName,
    },
    message,
  };

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);

  // Remove the chat that user send messages from the session.
  if (_.indexOf(currentClosedChats, receiverId.id) > -1) {
    Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, receiverId.id));
  }

  return makeCall('sendGroupChatMsg', destinationChatId, payload);
};

const getScrollPosition = (receiverID) => {
  const scroll = ScrollCollection.findOne({ receiver: receiverID },
    { fields: { position: 1 } }) || { position: null };
  return scroll.position;
};

const updateScrollPosition = (position, idChatOpen) => ScrollCollection.upsert(
  { receiver: idChatOpen },
  { $set: { position } },
);

const updateUnreadMessage = (timestamp, idChatOpen) => {
  const chatID = idChatOpen;
  const isPublic = chatID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_GROUP_CHAT_ID : chatID;
  return UnreadMessages.update(chatType, timestamp);
};

const clearPublicChatHistory = () => (makeCall('clearPublicChatHistory'));

const closePrivateChat = (chatId) => {
  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];

  if (_.indexOf(currentClosedChats, chatId) < 0) {
    currentClosedChats.push(chatId);

    Storage.setItem(CLOSED_CHAT_LIST_KEY, currentClosedChats);
  }
};

// if this private chat has been added to the list of closed ones, remove it
const removeFromClosedChatsSession = (idChatOpen) => {
  const chatID = idChatOpen;
  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);
  if (_.indexOf(currentClosedChats, chatID) > -1) {
    Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, chatID));
  }
};

// We decode to prevent HTML5 escaped characters.
const htmlDecode = (input) => {
  const e = document.createElement('div');
  e.innerHTML = input;
  const messages = Array.from(e.childNodes);
  const message = messages.map((chatMessage) => chatMessage.textContent);
  return message.join('');
};

// Export the chat as [Hour:Min] user: message
const exportChat = (timeWindowList, users, intl) => {
  const messageList = timeWindowList.reduce((acc, timeWindow) => {
    const msgs = timeWindow.content.map((message) => {
      const date = new Date(message.time);
      const hour = date.getHours().toString().padStart(2, 0);
      const min = date.getMinutes().toString().padStart(2, 0);
      const hourMin = `[${hour}:${min}]`;

      // Skip the reduce aggregation for the sync messages because they aren't localized, causing an error in line 268
      // Also they're temporary (preliminary) messages, so it doesn't make sense export them
      if (['SYSTEM_MESSAGE-sync-msg', 'synced'].includes(message.id)) return acc;

      let userName = message.id.startsWith(SYSTEM_CHAT_TYPE)
        ? ''
        : `${users[timeWindow.sender].name}: `;
      let messageText = '';
      if (message.text === PUBLIC_CHAT_CLEAR) {
        message.text = intl.formatMessage(intlMessages.publicChatClear);
      } else if (message.id.includes(CHAT_POLL_RESULTS_MESSAGE)) {
        userName = `${intl.formatMessage(intlMessages.pollResult)}:\n`;
        const { pollResultData } = timeWindow.extra;
        const pollText = htmlDecode(PollService.getPollResultString(pollResultData, intl).split('<br/>').join('\n'));
        // remove last \n to avoid empty line
        messageText = pollText.slice(0, -1);
      } else {
        messageText = message.text;
      }
      return `${hourMin} ${userName}${htmlDecode(messageText)}`;
    });

    return [...acc, ...msgs];
  }, []);

  return messageList.join('\n');
};

const getAllMessages = (chatID, messages) => {
  if (!messages[chatID]) {
    return [];
  }

  return (chatID === PUBLIC_GROUP_CHAT_ID)
    ? Object.values(messages[chatID].posJoinMessages)
    : Object.values(messages[chatID].messageGroups);
};

const maxTimestampReducer = (max, el) => ((el.timestamp > max) ? el.timestamp : max);

const maxNumberReducer = (max, el) => ((el > max) ? el : max);

const getLastMessageTimestampFromChatList = (activeChats, messages) => activeChats
  .map((chat) => ((chat.userId === 'public') ? 'MAIN-PUBLIC-GROUP-CHAT' : chat.chatId))
  .map((chatId) => getAllMessages(chatId, messages).reduce(maxTimestampReducer, 0))
  .reduce(maxNumberReducer, 0);

const removePackagedClassAttribute = (classnames, attribute) => {
  classnames.forEach((c) => {
    const elements = document.getElementsByClassName(c);
    if (elements) {
      // eslint-disable-next-line
      for (const [, v] of Object.entries(elements)) {
        v.removeAttribute(attribute);
      }
    }
  });
};

export default {
  setUserSentMessage,
  mapGroupMessage,
  reduceAndMapGroupMessages,
  reduceAndDontMapGroupMessages,
  getUser,
  getPrivateChatByUsers,
  getWelcomeProp,
  getScrollPosition,
  lastReadMessageTime,
  isChatLocked,
  updateScrollPosition,
  updateUnreadMessage,
  sendGroupMessage,
  closePrivateChat,
  removeFromClosedChatsSession,
  exportChat,
  clearPublicChatHistory,
  maxTimestampReducer,
  getLastMessageTimestampFromChatList,
  UnsentMessagesCollection,
  removePackagedClassAttribute,
};
