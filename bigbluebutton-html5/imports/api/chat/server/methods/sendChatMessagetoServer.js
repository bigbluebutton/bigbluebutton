import { publish } from '/imports/startup/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/startup/server/helpers';
import { translateHTML5ToFlash } from '/imports/startup/server/helpers';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

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

  // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  console.log('antes', message);

  message = message.replace(/[<>'"]/g, (c) => HTML_SAFE_MAP[c]);

  console.log('depois', message);

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

    if (isAllowedTo(action(), credentials) && chatObject.from_userid === requesterUserId) {
      chatObject.message = parseMessage(chatObject.message);
      let message = {
        payload: {
          message: chatObject,
          meeting_id: meetingId,
          requester_id: chatObject.from_userid,
        },
      };
      message = appendMessageHeader(eventName, message);
      logger.info('publishing chat to redis');
      publish(redisConfig.channels.toBBBApps.chat, message);
    }
  },
});
