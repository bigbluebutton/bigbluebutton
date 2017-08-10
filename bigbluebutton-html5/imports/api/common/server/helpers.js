import { redisPubSub } from '/imports/startup/server';
import { BREAK_LINE, CARRIAGE_RETURN, NEW_LINE } from '/imports/utils/lineEndings';
import WhiteboardMultiUser from '/imports/api/2.0/whiteboard-multi-user/';

export function appendMessageHeader(eventName, messageObj) {
  const header = {
    timestamp: new Date().getTime(),
    name: eventName,
  };
  messageObj.header = header;
  return messageObj;
}

export const indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i += 1) {
    if (i in this && this[i] === item) {
      return i;
    }
  }

  return -1;
};

export function publish(channel, message) {
  return redisPubSub.publish(channel, message.header.name, message.payload, message.header);
}

// translate '\n' newline character and '\r' carriage
// returns to '<br/>' breakline character for Flash
export const translateHTML5ToFlash = function (message) {
  let result = message;
  result = result.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
  result = result.replace(new RegExp(NEW_LINE, 'g'), BREAK_LINE);
  return result;
};

export const inReplyToHTML5Client = function (arg) {
  return arg.routing.userId === 'nodeJSapp';
};

export const getMultiUserStatus = (meetingId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId });

  if (data) {
    return data.multiUser;
  }

  return false;
};
