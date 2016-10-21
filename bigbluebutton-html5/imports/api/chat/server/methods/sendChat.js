import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { translateHTML5ToFlash } from '/imports/api/common/server/helpers';
import RegexWebUrl from '/imports/utils/regex-weburl';

const HTML_SAFE_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const PUBLIC_CHAT_TYPE = 'PUBLIC_CHAT';

const parseMessage = (message) => {
  message = message || '';
  message = message.trim();

  // Replace <br/> with \n\r
  message = message.replace(/<br\s*[\/]?>/gi, '\n\r');

  // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  message = message.replace(/[<>'"]/g, c => HTML_SAFE_MAP[c]);

  // Replace flash links to flash valid ones
  message = message.replace(RegexWebUrl, "<a href='event:$&'><u>$&</u></a>");

  return message;
};

export default function sendChat(credentials, message) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.chat;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(message, Object);

  let actionName = message.to_userid === requesterUserId ? 'chatSelf' : 'chatPrivate';
  let eventName = 'send_private_chat_message';

  if (message.chat_type === PUBLIC_CHAT_TYPE) {
    eventName = 'send_public_chat_message';
    actionName = 'chatPublic';
  }

  if (!isAllowedTo(actionName, credentials)
      && message.from_userid !== requesterUserId) {
    throw new Meteor.Error('not-allowed', `You are not allowed to sendChat`);
  }

  let payload = {
    message,
    meeting_id: meetingId,
    requester_id: message.from_userid,
  };

  return RedisPubSub.publish(CHANNEL, eventName, payload);
};
