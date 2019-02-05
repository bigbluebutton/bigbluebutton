import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import GroupChatMsg from '/imports/api/group-chat-msg';
import GroupChat from '/imports/api/group-chat';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import mapUser from '/imports/ui/services/user/mapUser';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';

const CHAT_CONFIG = Meteor.settings.public.chat;
const GROUPING_MESSAGES_WINDOW = CHAT_CONFIG.grouping_messages_window;

const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PRIVATE_CHAT_TYPE = CHAT_CONFIG.type_private;
const PUBLIC_CHAT_USER_ID = CHAT_CONFIG.system_userid;
const PUBLIC_CHAT_CLEAR = CHAT_CONFIG.system_messages_keys.chat_clear;

const ScrollCollection = new Mongo.Collection(null);

const UnsentMessagesCollection = new Mongo.Collection(null);

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const getUser = (userId) => {
  const user = Users.findOne({ userId });

  if (!user) {
    return null;
  }

  return mapUser(user);
};

const getMeeting = () => Meetings.findOne({});

const mapGroupMessage = (message) => {
  const mappedMessage = {
    id: message._id,
    content: message.content,
    time: message.timestamp,
    sender: null,
  };

  if (message.sender !== SYSTEM_CHAT_TYPE) {
    const sender = getUser(message.sender);

    const {
      color,
      isModerator,
      name,
      isOnline,
    } = sender;

    const mappedSender = {
      color,
      isModerator,
      name,
      isOnline,
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
  }];
  if (!lastMessage || !currentMessage.chatId === PUBLIC_GROUP_CHAT_ID) {
    return previous.concat(currentMessage);
  }
  // Check if the last message is from the same user and time discrepancy
  // between the two messages exceeds window and then group current message
  // with the last one
  const timeOfLastMessage = lastMessage.content[lastMessage.content.length - 1].time;
  if (lastMessage.sender === currentMessage.sender
    && (currentMessage.timestamp - timeOfLastMessage) <= GROUPING_MESSAGES_WINDOW) {
    lastMessage.content.push(currentMessage.content.pop());
    return previous;
  }

  return previous.concat(currentMessage);
};

const reduceAndMapGroupMessages = messages => (messages
  .reduce(reduceGroupMessages, []).map(mapGroupMessage));

const getPublicGroupMessages = () => {
  const publicGroupMessages = GroupChatMsg.find({
    chatId: PUBLIC_GROUP_CHAT_ID,
  }, { sort: ['timestamp'] }).fetch();
  return publicGroupMessages;
};

const getPrivateGroupMessages = () => {
  const chatID = Session.get('idChatOpen');
  const sender = getUser(Auth.userID);

  const privateChat = GroupChat.findOne({
    users: { $all: [chatID, sender.id] },
    access: PRIVATE_CHAT_TYPE,
  });

  let messages = [];

  if (privateChat) {
    const {
      chatId,
    } = privateChat;

    messages = GroupChatMsg.find({
      chatId,
    }, { sort: ['timestamp'] }).fetch();
  }

  return reduceAndMapGroupMessages(messages, []);
};

const isChatLocked = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;

  const meeting = Meetings.findOne({});
  const user = Users.findOne({ userId: Auth.userID });

  if (meeting.lockSettingsProp !== undefined) {
    const isPubChatLocked = meeting.lockSettingsProp.disablePubChat;
    const isPrivChatLocked = meeting.lockSettingsProp.disablePrivChat;

    return mapUser(user).isLocked
      && ((isPublic && isPubChatLocked) || (!isPublic && isPrivChatLocked));
  }

  return false;
};

const hasUnreadMessages = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_GROUP_CHAT_ID : receiverID;
  return UnreadMessages.count(chatType) > 0;
};

const lastReadMessageTime = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_GROUP_CHAT_ID : receiverID;

  return UnreadMessages.get(chatType);
};

const sendGroupMessage = (message) => {
  const chatID = Session.get('idChatOpen') || PUBLIC_CHAT_ID;
  const isPublicChat = chatID === PUBLIC_CHAT_ID;

  let chatId = PUBLIC_GROUP_CHAT_ID;

  const sender = getUser(Auth.userID);

  const receiver = !isPublicChat ? getUser(chatID) : { id: chatID };

  if (!isPublicChat) {
    const privateChat = GroupChat.findOne({ users: { $all: [chatID, sender.id] } });

    if (privateChat) {
      const { chatId: privateChatId } = privateChat;

      chatId = privateChatId;
    }
  }

  const payload = {
    color: '0',
    correlationId: `${sender.id}-${Date.now()}`,
    sender: {
      id: sender.id,
      name: sender.name,
    },
    message,
  };

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);

  // Remove the chat that user send messages from the session.
  if (_.indexOf(currentClosedChats, receiver.id) > -1) {
    Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, receiver.id));
  }

  return makeCall('sendGroupChatMsg', chatId, payload);
};

const getScrollPosition = (receiverID) => {
  const scroll = ScrollCollection.findOne({ receiver: receiverID }) || { position: null };
  return scroll.position;
};

const updateScrollPosition = position => ScrollCollection.upsert(
  { receiver: Session.get('idChatOpen') },
  { $set: { position } },
);

const updateUnreadMessage = (timestamp) => {
  const chatID = Session.get('idChatOpen') || PUBLIC_CHAT_ID;
  const isPublic = chatID === PUBLIC_CHAT_ID;
  const chatType = isPublic ? PUBLIC_GROUP_CHAT_ID : chatID;
  return UnreadMessages.update(chatType, timestamp);
};

const clearPublicChatHistory = () => (makeCall('clearPublicChatHistory'));

const closePrivateChat = () => {
  const chatID = Session.get('idChatOpen');
  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];

  if (_.indexOf(currentClosedChats, chatID) < 0) {
    currentClosedChats.push(chatID);

    Storage.setItem(CLOSED_CHAT_LIST_KEY, currentClosedChats);
  }
};

// if this private chat has been added to the list of closed ones, remove it
const removeFromClosedChatsSession = () => {
  const chatID = Session.get('idChatOpen');
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
const exportChat = (messageList) => {
  const { welcomeProp } = getMeeting();
  const { loginTime } = getUser(Auth.userID);
  const { welcomeMsg } = welcomeProp;

  const clearMessage = messageList.filter(message => message.message === PUBLIC_CHAT_CLEAR);

  const hasClearMessage = clearMessage.length;

  if (!hasClearMessage || (hasClearMessage && clearMessage[0].timestamp < loginTime)) {
    messageList.push({
      timestamp: loginTime,
      message: welcomeMsg,
      type: SYSTEM_CHAT_TYPE,
      sender: PUBLIC_CHAT_USER_ID,
    });
  }

  messageList.sort((a, b) => a.timestamp - b.timestamp);

  return messageList.map((message) => {
    const date = new Date(message.timestamp);
    const hour = date.getHours().toString().padStart(2, 0);
    const min = date.getMinutes().toString().padStart(2, 0);
    const hourMin = `[${hour}:${min}]`;
    if (message.type === SYSTEM_CHAT_TYPE) {
      return `${hourMin} ${message.message}`;
    }
    const userName = message.sender === PUBLIC_CHAT_USER_ID ? '' : `${getUser(message.sender).name} :`;
    return `${hourMin} ${userName} ${htmlDecode(message.message)}`;
  }).join('\n');
};

const getUnreadMessagesFromChatId = chatId => UnreadMessages.getUnreadMessages(chatId);

const getAllMessages = (chatID) => {
  const filter = {
    sender: { $ne: Auth.userID },
  };
  if (chatID === PUBLIC_GROUP_CHAT_ID) {
    filter.chatId = { $eq: chatID };
  } else {
    const privateChat = GroupChat.findOne({ users: { $all: [chatID, Auth.userID] } });

    filter.chatId = { $ne: PUBLIC_GROUP_CHAT_ID };

    if (privateChat) {
      filter.chatId = privateChat.chatId;
    }
  }
  const messages = GroupChatMsg.find(filter).fetch();
  return messages;
};

const getlastMessage = lastMessages => lastMessages.sort((a,
  b) => a.timestamp - b.timestamp).pop();

const maxTimestampReducer = (max, el) => ((el.timestamp > max) ? el.timestamp : max);

const maxNumberReducer = (max, el) => ((el > max) ? el : max);

const getLastMessageTimestampFromChatList = activeChats => activeChats
  .map(chat => ((chat.id === 'public') ? 'MAIN-PUBLIC-GROUP-CHAT' : chat.id))
  .map(chatId => getAllMessages(chatId).reduce(maxTimestampReducer, 0))
  .reduce(maxNumberReducer, 0);

export default {
  reduceAndMapGroupMessages,
  getPublicGroupMessages,
  getPrivateGroupMessages,
  getUser,
  getMeeting,
  getScrollPosition,
  hasUnreadMessages,
  lastReadMessageTime,
  isChatLocked,
  updateScrollPosition,
  updateUnreadMessage,
  sendGroupMessage,
  closePrivateChat,
  removeFromClosedChatsSession,
  exportChat,
  clearPublicChatHistory,
  getlastMessage,
  getUnreadMessagesFromChatId,
  getAllMessages,
  maxTimestampReducer,
  maxNumberReducer,
  getLastMessageTimestampFromChatList,
  UnsentMessagesCollection,
};
