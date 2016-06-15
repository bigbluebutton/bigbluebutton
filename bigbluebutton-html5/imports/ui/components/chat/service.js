import Chats from '/imports/api/chat';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';

import Auth from '/imports/ui/services/auth';

import { callServer } from '/imports/ui/services/api';

const GROUPING_MESSAGES_WINDOW = 60000;

const SYSTEM_CHAT_TYPE = 'SYSTEM_MESSAGE';
const PUBLIC_CHAT_TYPE = 'PUBLIC_CHAT';
const PRIVATE_CHAT_TYPE = 'PRIVATE_CHAT';

const PUBLIC_CHAT_ID = 'public';

/* TODO: Same map is done in the user-list/service we should share this someway */

const mapUser = (user) => ({
  id: user.userid,
  name: user.name,
  isPresenter: user.presenter,
  isModerator: user.role === 'MODERATOR',
  isCurrent: user.userid === Auth.getUser(),
  isVoiceUser: user.voiceUser.joined,
  isMuted: user.voiceUser.muted,
  isListenOnly: user.listenOnly,
  isSharingWebcam: user.webcam_stream.length,
  isLocked: user.locked,
});

const mapMessage = (message) => {
  let mappedMessage = {
    content: [message.message],
    time: +(message.from_time), //+ message.from_tz_offset,
    sender: null,
  };

  if (message.chat_type !== SYSTEM_CHAT_TYPE) {
    mappedMessage.sender = getUser(message.from_userid);
  }

  return mappedMessage;
};

const reduceMessages = (previous, current, index, array) => {
  let lastMessage = previous[previous.length - 1];

  if (!lastMessage || !lastMessage.sender || !current.sender) { // Skip system messages
    return previous.concat(current);
  }

  // Check if the last message is from the same user and time discrepancy
  // between the two messages exceeds window and then group current message
  // with the last one

  if (lastMessage.sender.id === current.sender.id
   && (current.time - lastMessage.time) <= GROUPING_MESSAGES_WINDOW) {
    lastMessage.content = lastMessage.content.concat(current.content);
    return previous;
  } else {
    return previous.concat(current);
  }
};

const getUser = (userID) => {
  const user = Users.findOne({ userId: userID });
  if (user) {
    return mapUser(user.user);
  } else {
    return null;
  }
};

const getPublicMessages = () => {
  let publicMessages = Chats.find({
    'message.chat_type': { $in: [PUBLIC_CHAT_TYPE, SYSTEM_CHAT_TYPE] },
  }, {
    sort: ['message.from_time'],
  })
  .fetch();

  let systemMessage = Chats.findOne({ 'message.chat_type': SYSTEM_CHAT_TYPE });

  return publicMessages
    .map(m => m.message)
    .map(mapMessage)
    .reduce(reduceMessages, []);
};

const getPrivateMessages = (userID) => {
  let messages = Chats.find({
    'message.chat_type': PRIVATE_CHAT_TYPE,
    $or: [
      { 'message.to_userid': userID },
      { 'message.from_userid': userID },
    ],
  }, {
    sort: ['message.from_time'],
  }).fetch();

  return messages
    .map(m => m.message)
    .map(mapMessage)
    .reduce(reduceMessages, []);
};

const isChatLocked = (receiverID) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;
  const currentUser = getUser(Auth.getUser());
  const meeting = Meetings.findOne({});

  const lockSettings = meeting.roomLockSettings || {
    disablePublicChat: false,
    disablePrivateChat: false,
  };

  if (!currentUser.isLocked || currentUser.isPresenter) {
    return false;
  }

  return isPublic ? lockSettings.disablePublicChat : lockSettings.disablePrivateChat;
};

const sendMessage = (receiverID, message) => {
  const isPublic = receiverID === PUBLIC_CHAT_ID;

  const sender = getUser(Auth.getUser());
  const receiver = !isPublic ? getUser(receiverID) : {
    id: 'public_chat_userid',
    name: 'public_chat_username',
  };

  /* FIX: Why we need all this payload to send a message?
   * The server only really needs the message, from_userid, to_userid and from_lang
   */

  let messagePayload = {
    message: message,
    chat_type: isPublic ? PUBLIC_CHAT_TYPE : PRIVATE_CHAT_TYPE,
    from_userid: sender.id,
    from_username: sender.name,
    from_tz_offset: (new Date()).getTimezoneOffset(),
    to_username: receiver.name,
    to_userid: receiver.id,
    from_lang: window.navigator.userLanguage || window.navigator.language,
    from_time: Date.now(),
    from_color: 0,
  };

  return callServer('sendChatMessagetoServer', messagePayload);
};

export default {
  getPublicMessages,
  getPrivateMessages,
  getUser,
  isChatLocked,
  sendMessage,
};
