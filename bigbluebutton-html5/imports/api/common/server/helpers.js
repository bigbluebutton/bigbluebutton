import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

export const indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i += 1) {
    if (i in this && this[i] === item) {
      return i;
    }
  }

  return -1;
};

// used in 1.1
export const inReplyToHTML5Client = arg => arg.routing.userId === 'nodeJSapp';

export const getMultiUserStatus = (meetingId, whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId, whiteboardId });

  if (data) {
    return data.multiUser;
  }

  return false;
};
