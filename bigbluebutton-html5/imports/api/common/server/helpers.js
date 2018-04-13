import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const MSG_DIRECT_TYPE = 'DIRECT';
const NODE_USER = 'nodeJSapp';

export const indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i += 1) {
    if (i in this && this[i] === item) {
      return i;
    }
  }

  return -1;
};

export const processForHTML5ServerOnly = fn => (message, ...args) => {
  const { envelope } = message;
  const { routing } = envelope;


  const shouldSkip = routing.msgType === MSG_DIRECT_TYPE && routing.userId !== NODE_USER;
  if (shouldSkip) return () => { };

  return fn(...args);
};


export const getMultiUserStatus = (meetingId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId });

  if (data) {
    return data.multiUser;
  }

  return false;
};
