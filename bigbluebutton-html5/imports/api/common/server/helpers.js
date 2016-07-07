import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import { clearChatCollection} from '/imports/api/chat/server/modifiers/clearChatCollection';
import { clearShapesCollection } from '/imports/api/shapes/server/modifiers/clearShapesCollection';
import { clearSlidesCollection } from '/imports/api/slides/server/modifiers/clearSlidesCollection';
import { clearPresentationsCollection }
  from '/imports/api/presentations/server/modifiers/clearPresentationsCollection';
import { clearMeetingsCollection}
  from '/imports/api/meetings/server/modifiers/clearMeetingsCollection';
import { clearPollCollection } from '/imports/api/polls/server/modifiers/clearPollCollection';
import { clearCursorCollection } from '/imports/api/cursor/server/modifiers/clearCursorCollection';
import { logger } from '/imports/startup/server/logger';
import { redisPubSub } from '/imports/startup/server';

export function appendMessageHeader(eventName, messageObj) {
  let header;
  header = {
    timestamp: new Date().getTime(),
    name: eventName,
  };
  messageObj.header = header;
  return messageObj;
};

export function clearCollections() {

  //This is to prevent collection clearing in development environment
  if (process.env.NODE_ENV === "development") {
    return;
  }

  clearUsersCollection();
  clearChatCollection();
  clearMeetingsCollection();
  clearShapesCollection();
  clearSlidesCollection();
  clearPresentationsCollection();
  clearPollCollection();
  clearCursorCollection();
}

export const indexOf = [].indexOf || function (item) {
    for (let i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) {
        return i;
      }
    }

    return -1;
  };

export function publish(channel, message) {
  logger.info(`redis outgoing message  ${message.header.name}`, {
    channel: channel,
    message: message,
  });
  if (redisPubSub != null) {
    return redisPubSub.pubClient.publish(channel, JSON.stringify(message), (err, res) => {
      if (err) {
        return logger.info('error', {
          error: err,
        });
      }
    });
  } else {
    return logger.info('ERROR!! redisPubSub was undefined');
  }
};

// translate '\n' newline character and '\r' carriage
// returns to '<br/>' breakline character for Flash
export const translateHTML5ToFlash = function (message) {
  let result = message;
  result = result.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
  result = result.replace(new RegExp(NEW_LINE, 'g'), BREAK_LINE);
  return result;
};

// when requesting for history information we pass this made up requesterID
// We want to handle only the reports we requested
export const inReplyToHTML5Client = function (arg) {
  return arg.payload.requester_id === 'nodeJSapp';
};
