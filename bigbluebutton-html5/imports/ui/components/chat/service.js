import Chats from '/imports/api/chat';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import mapUser from '/imports/ui/services/user/mapUser';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';

const CHAT_CONFIG = Meteor.settings.public.chat;
const GROUPING_MESSAGES_WINDOW = CHAT_CONFIG.grouping_messages_window;

const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const PUBLIC_CHAT_USERID = CHAT_CONFIG.public_userid;
const PUBLIC_CHAT_USERNAME = CHAT_CONFIG.public_username;

const ScrollCollection = new Mongo.Collection(null);

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const getUser = (userId) => {
  const user = Users.findOne({ userId });

  if (!user) {
    return null;
  }

  return mapUser(user);
};

const mapMessage = (message) => {
  const mappedMessage = {
    id: message._id,
    content: message.content,
    time: message.fromTime, // + message.from_tz_offset,
    sender: null,
  };

  if (message.type !== SYSTEM_CHAT_TYPE) {
    mappedMessage.sender = getUser(message.fromUserId);
  }

  return mappedMessage;
};

const reduceMessages = (previous, current) => {
  const lastMessage = previous[previous.length - 1];
  const currentMessage = current;

  currentMessage.content = [{
    id: current._id,
    text: current.message,
    time: current.fromTime,
  }];

  if (!lastMessage || !currentMessage.type === SYSTEM_CHAT_TYPE) {
    return previous.concat(currentMessage);
  }

  // Check if the last message is from the same user and time discrepancy
  // between the two messages exceeds window and then group current message
  // with the last one
  const timeOfLastMessage = lastMessage.content[lastMessage.content.length - 1].time;
  if (lastMessage.fromUserId === currentMessage.fromUserId
    && (currentMessage.fromTime - timeOfLastMessage) <= GROUPING_MESSAGES_WINDOW) {
    lastMessage.content.push(currentMessage.content.pop());
    return previous;
  }

  return previous.concat(currentMessage);
};

const reduceAndMapMessages = messages =>
  (messages.reduce(reduceMessages, []).map(mapMessage));

const getPublicMessages = () => {
  const publicMessages = Chats.find({
    type: { $in: [PUBLIC_CHAT_TYPE, SYSTEM_CHAT_TYPE] },
  }, {
    sort: ['fromTime'],
  }).fetch();

  return publicMessages;
};

const getPrivateMessages = (userID) => {
  const messages = Chats.find({
    toUsername: { $ne: PUBLIC_CHAT_USERNAME },
    $or: [
      { toUserId: userID },
      { fromUserId: userID },
    ],
  }, {
    sort: ['fromTime'],
  }).fetch();
  return reduceAndMapMessages(messages);
};

const isChatLocked = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;

  const meeting = Meetings.findOne({});
  const user = Users.findOne({});

  if (meeting.lockSettingsProp !== undefined) {
    const isPubChatLocked = meeting.lockSettingsProp.disablePubChat;
    const isPrivChatLocked = meeting.lockSettingsProp.disablePrivChat;
    const isViewer = user.role === 'VIEWER';

    return (isPublic && isPubChatLocked && isViewer && user.locked)
      || (!isPublic && isPrivChatLocked && isViewer && user.locked);
  }

  return false;
};

const hasUnreadMessages = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_CHAT_USERID : receiverID;
  return UnreadMessages.count(chatType) > 0;
};

const lastReadMessageTime = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_CHAT_USERID : receiverID;

  return UnreadMessages.get(chatType);
};

const sendMessage = (receiverID, message) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;

  const sender = getUser(Auth.userID);
  const receiver = !isPublic ? getUser(receiverID) : {
    id: PUBLIC_CHAT_USERID,
    name: PUBLIC_CHAT_USERNAME,
  };

  /* FIX: Why we need all this payload to send a message?
   * The server only really needs the message, from_userid, to_userid and from_lang
   */
  const messagePayload = {
    message,
    fromUserId: sender.id,
    fromUsername: sender.name,
    fromTimezoneOffset: (new Date()).getTimezoneOffset(),
    toUsername: receiver.name,
    toUserId: receiver.id,
    fromColor: 0,
  };

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);

  // Remove the chat that user send messages from the session.
  if (_.indexOf(currentClosedChats, receiver.id) > -1) {
    Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, receiver.id));
  }

  return makeCall('sendChat', messagePayload);
};

const getScrollPosition = (receiverID) => {
  const scroll = ScrollCollection.findOne({ receiver: receiverID }) || { position: null };
  return scroll.position;
};

const updateScrollPosition =
  (receiverID, position) => ScrollCollection.upsert(
    { receiver: receiverID },
    { $set: { position } },
  );

const updateUnreadMessage = (receiverID, timestamp) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_CHAT_USERID : receiverID;
  return UnreadMessages.update(chatType, timestamp);
};

const clearPublicChatHistory = () => (makeCall('clearPublicChatHistory'));

const closePrivateChat = (chatID) => {
  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];

  if (_.indexOf(currentClosedChats, chatID) < 0) {
    currentClosedChats.push(chatID);

    Storage.setItem(CLOSED_CHAT_LIST_KEY, currentClosedChats);
  }
};

// if this private chat has been added to the list of closed ones, remove it
const removeFromClosedChatsSession = (chatID) => {
  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);
  if (_.indexOf(currentClosedChats, chatID) > -1) {
    Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, chatID));
  }
};

// We decode to prevent HTML5 escaped characters.
const htmlDecode = (input) => {
  const e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
};

// Export the chat as [Hour:Min] user: message
const exportChat = messageList => (
  messageList.map((message) => {
    const date = new Date(message.fromTime);
    const hour = date.getHours().toString().padStart(2, 0);
    const min = date.getMinutes().toString().padStart(2, 0);
    const hourMin = `[${hour}:${min}]`;
    if (message.type === SYSTEM_CHAT_TYPE) {
      return `${hourMin} ${message.message}`;
    }
    return `${hourMin} ${message.fromUsername}: ${htmlDecode(message.message)}`;
  }).join('\n')
);

const setNotified = (chatType, item) => {
  const notified = Storage.getItem('notified');
  const key = 'notified';
  const userChat = { [chatType]: item };
  if (notified) {
    Storage.setItem(key, {
      ...notified,
      ...userChat,
    });
    return;
  }
  Storage.setItem(key, {
    ...userChat,
  });
};

const getNotified = (chat) => {
  const key = 'notified';
  const notified = Storage.getItem(key);
  if (notified) return notified[chat] || {};
  return {};
};

export default {
  getUnreadMessages: UnreadMessages.getUnreadMessages,
  reduceAndMapMessages,
  getPublicMessages,
  getPrivateMessages,
  getUser,
  getScrollPosition,
  hasUnreadMessages,
  lastReadMessageTime,
  isChatLocked,
  updateScrollPosition,
  updateUnreadMessage,
  sendMessage,
  closePrivateChat,
  removeFromClosedChatsSession,
  exportChat,
  clearPublicChatHistory,
  setNotified,
  getNotified,
};
