import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import GroupChat from '/imports/api/group-chat';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const GROUPING_MESSAGES_WINDOW = CHAT_CONFIG.grouping_messages_window;

const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PRIVATE_CHAT_TYPE = CHAT_CONFIG.type_private;
const PUBLIC_CHAT_USER_ID = CHAT_CONFIG.system_userid;
const PUBLIC_CHAT_CLEAR = CHAT_CONFIG.system_messages_keys.chat_clear;

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const CONNECTION_STATUS_ONLINE = 'online';

const ScrollCollection = new Mongo.Collection(null);

const UnsentMessagesCollection = new Mongo.Collection(null);

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const getUser = userId => Users.findOne({ userId });

const getWelcomeProp = () => Meetings.findOne({ meetingId: Auth.meetingID },
  { fields: { welcomeProp: 1 } });

const mapGroupMessage = (message) => {
  const mappedMessage = {
    id: message._id,
    content: message.content,
    time: message.timestamp,
    sender: null,
  };

  if (message.sender !== SYSTEM_CHAT_TYPE) {
    const sender = Users.findOne({ userId: message.sender },
      {
        fields: {
          color: 1, role: 1, name: 1, connectionStatus: 1,
        },
      });
    const {
      color,
      role,
      name,
      connectionStatus,
    } = sender;

    const mappedSender = {
      color,
      isModerator: role === ROLE_MODERATOR,
      name,
      isOnline: connectionStatus === CONNECTION_STATUS_ONLINE,
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
    meetingId: Auth.meetingID,
    chatId: PUBLIC_GROUP_CHAT_ID,
  }, { sort: ['timestamp'] }).fetch();
  return publicGroupMessages;
};

const getPrivateGroupMessages = () => {
  const chatID = Session.get('idChatOpen');
  const senderId = Auth.userID;

  const privateChat = GroupChat.findOne({
    meetingId: Auth.meetingID,
    users: { $all: [chatID, senderId] },
    access: PRIVATE_CHAT_TYPE,
  });

  let messages = [];

  if (privateChat) {
    const {
      chatId,
    } = privateChat;

    messages = GroupChatMsg.find({
      meetingId: Auth.meetingID,
      chatId,
    }, { sort: ['timestamp'] }).fetch();
  }

  return reduceAndMapGroupMessages(messages, []);
};

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
  const chatID = Session.get('idChatOpen');
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

  const payload = {
    color: '0',
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

const updateScrollPosition = position => ScrollCollection.upsert(
  { receiver: Session.get('idChatOpen') },
  { $set: { position } },
);

const updateUnreadMessage = (timestamp) => {
  const chatID = Session.get('idChatOpen');
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
  const messages = Array.from(e.childNodes);
  const message = messages.map(chatMessage => chatMessage.textContent);
  return message.join('');
};

// Export the chat as [Hour:Min] user: message
const exportChat = (messageList) => {
  const { welcomeProp } = getWelcomeProp();
  const { loginTime } = Users.findOne({ userId: Auth.userID }, { fields: { loginTime: 1 } });
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
    const userName = message.sender === PUBLIC_CHAT_USER_ID
      ? ''
      : `${getUser(message.sender).name} :`;
    return `${hourMin} ${userName} ${htmlDecode(message.message)}`;
  }).join('\n');
};

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

const maxTimestampReducer = (max, el) => ((el.timestamp > max) ? el.timestamp : max);

const maxNumberReducer = (max, el) => ((el > max) ? el : max);

const getLastMessageTimestampFromChatList = activeChats => activeChats
  .map(chat => ((chat.userId === 'public') ? 'MAIN-PUBLIC-GROUP-CHAT' : chat.userId))
  .map(chatId => getAllMessages(chatId).reduce(maxTimestampReducer, 0))
  .reduce(maxNumberReducer, 0);

export default {
  reduceAndMapGroupMessages,
  getPublicGroupMessages,
  getPrivateGroupMessages,
  getUser,
  getWelcomeProp,
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
  maxTimestampReducer,
  getLastMessageTimestampFromChatList,
  UnsentMessagesCollection,
};
