import { publish } from '/imports/startup/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/startup/server/helpers';
import { translateHTML5ToFlash } from '/imports/startup/server/collectionManagers/chat';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

Meteor.methods({
  // meetingId: the id of the meeting
  // chatObject: the object including info on the chat message, including the text
  // requesterUserId: the userId of the user sending chat
  // requesterToken: the authToken of the requester
  sendChatMessagetoServer(meetingId, chatObject, requesterUserId, requesterToken) {
    let action, chatType, eventName, message, recipient;
    chatType = chatObject.chat_type;
    recipient = chatObject.to_userid;
    eventName = null;
    action = function () {
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

    if (isAllowedTo(action(), meetingId, requesterUserId, requesterToken) && chatObject.from_userid === requesterUserId) {
      chatObject.message = translateHTML5ToFlash(chatObject.message);
      message = {
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
