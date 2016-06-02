import Chats from '/imports/api/chat';
import Users from '/imports/api/users';
import LocalStorage from '/imports/ui/services/storage';

import RegexWebUrl from '/imports/utils/regex-weburl';

const BREAK_TAG = '<br/>';
const GROUPING_MESSAGES_WINDOW = 60000;

const SYSTEM_CHAT_TYPE = 'SYSTEM_MESSAGE';
const PUBLIC_CHAT_TYPE = 'PUBLIC_CHAT';
const PRIVATE_CHAT_TYPE = 'PRIVATE_CHAT';

const CURRENT_USER_ID = LocalStorage.get('userID');

/* TODO: Same map is done in the user-list/service we should share this someway */

const mapUser = (user) => ({
  id: user.userid,
  name: user.name,
  isPresenter: user.presenter,
  isModerator: user.role === 'MODERATOR',
  isCurrent: user.userid === CURRENT_USER_ID,
  isVoiceUser: user.voiceUser.joined,
  isMuted: user.voiceUser.muted,
  isListenOnly: user.listenOnly,
  isSharingWebcam: user.webcam_stream.length,
});

const parseMessage = (message) => {
  message = message || '';

  // Replace \r and \n to <br/>
  message = message.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + BREAK_TAG + '$2');

  // Replace flash links to html valid ones
  message = message.split(`<a href='event:`).join(`<a target="_blank" href='`);
  message = message.split(`<a href="event:`).join(`<a target="_blank" href="`);

  // message = message.replace(RegexWebUrl, '<a href="$1" target="_blank">$1</a>');

  return message;
};

const mapMessage = (message) => {
  let mappedMessage = {
    content: [parseMessage(message.message)],
    time: +(message.from_time), //+ message.from_tz_offset,
    sender: null,
  };

  if (message.from_userid !== SYSTEM_CHAT_TYPE) {
    let user = Users.findOne({ userId: message.from_userid });
    mappedMessage.sender = mapUser(user.user);
  }

  return mappedMessage;
};

const reduceMessages = (previous, current, index, array) => {
  let lastMessage = previous[previous.length - 1];

  if (!lastMessage || !lastMessage.sender || !current.sender) { // Skip system messages
    console.log(current.content);
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

const sendMessage = (toUserID, message) => {
  let messages = Chats.find({
    chat_type: PRIVATE_CHAT_TYPE,
    from_userid: userID,
  });

  return messages;
};

export default {
  getPublicMessages,
  getPrivateMessages,
  sendMessage,
};
