import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import RegexWebUrl from '/imports/utils/regex-weburl';

const HTML_SAFE_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const parseMessage = (message) => {
  let parsedMessage = message || '';
  parsedMessage = parsedMessage.trim();

  // Replace <br/> with \n\r
  parsedMessage = parsedMessage.replace(/<br\s*[\\/]?>/gi, '\n\r');

  // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  parsedMessage = parsedMessage.replace(/[<>'"]/g, c => HTML_SAFE_MAP[c]);

  // Replace flash links to flash valid ones
  parsedMessage = parsedMessage.replace(RegexWebUrl, "<a href='event:$&'><u>$&</u></a>");

  return parsedMessage;
};

export default function sendChat(credentials, message) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const TO_PUBLIC_CHAT = CHAT_CONFIG.public_username;

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(message, Object);

  let eventName = 'SendPrivateMessagePubMsg';

  const parsedMessage = message;

  parsedMessage.message = parseMessage(message.message);

  if (message.toUsername === TO_PUBLIC_CHAT) {
    eventName = 'SendPublicMessagePubMsg';
  }

  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId,
   { message: parsedMessage });
}
