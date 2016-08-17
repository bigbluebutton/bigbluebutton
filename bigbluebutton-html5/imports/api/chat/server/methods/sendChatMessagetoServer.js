import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import { translateHTML5ToFlash } from '/imports/api/common/server/helpers';
import { logger } from '/imports/startup/server/logger';

import RegexWebUrl from '/imports/utils/regex-weburl';

const HTML_SAFE_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

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

Meteor.methods({
  // meetingId: the id of the meeting
  // chatObject: the object including info on the chat message, including the text
  // requesterUserId: the userId of the user sending chat
  // requesterToken: the authToken of the requester
  sendChatMessagetoServer(credentials, chatObject) {
    const REDIS_CONFIG = Meteor.settings.redis;

    const { meetingId, requesterUserId, requesterToken } = credentials;

    let message;
    const chatType = chatObject.chat_type;
    const recipient = chatObject.to_userid;
    let eventName = null;

    const action = function () {
      if (chatType === 'PUBLIC_CHAT') {
        eventName = 'send_public_chat_message';
        return 'chatPublic';
      } else {
        eventName = 'send_private_chat_message';
        if (recipient === requesterUserId) {
          return 'chatSelf'; //not allowed
        } else {
          return 'chatPrivate';
        }
      }
    };

    chatObject.message = parseMessage(chatObject.message);

    if (isAllowedTo(action(), credentials) && chatObject.from_userid === requesterUserId) {
      let message = {
        payload: {
          message: chatObject,
          meeting_id: meetingId,
          requester_id: chatObject.from_userid,
        },
      };
      message = appendMessageHeader(eventName, message);
      logger.info('publishing chat to redis');
      publish(REDIS_CONFIG.channels.toBBBApps.chat, message);
    }
  },
});
