import { logger } from '/imports/startup/server/logger';
import { redisPubSub } from '/imports/startup/server';
import { BREAK_LINE, CARRIAGE_RETURN, NEW_LINE } from '/imports/utils/lineEndings.js';

export function appendMessageHeader(eventName, messageObj) {
  let header;
  header = {
    timestamp: new Date().getTime(),
    name: eventName,
  };
  messageObj.header = header;
  return messageObj;
};

export const indexOf = [].indexOf || function (item) {
    for (let i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) {
        return i;
      }
    }

    return -1;
  };

export function publish(channel, message) {
  return redisPubSub.publish(channel, message.header.name, message.payload, message.header);
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
