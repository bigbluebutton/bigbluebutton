import Users from '/imports/api/users';

const MSG_DIRECT_TYPE = 'DIRECT';
const NODE_USER = 'nodeJSapp';

export const spokeTimeoutHandles = {};
export const clearSpokeTimeout = (meetingId, userId) => {
  if (spokeTimeoutHandles[`${meetingId}-${userId}`]) {
    Meteor.clearTimeout(spokeTimeoutHandles[`${meetingId}-${userId}`]);
    delete spokeTimeoutHandles[`${meetingId}-${userId}`];
  }
};

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
  const { msgType, meetingId, userId } = routing;

  const selector = {
    userId,
    meetingId,
  };

  const user = Users.findOne(selector);

  const shouldSkip = user && msgType === MSG_DIRECT_TYPE && userId !== NODE_USER && user.clientType !== 'HTML5';
  if (shouldSkip) return () => { };
  return fn(message, ...args);
};

export const extractCredentials = (credentials) => {
  if (!credentials) return {};
  const credentialsArray = credentials.split('--');
  const meetingId = credentialsArray[0];
  const requesterUserId = credentialsArray[1];
  return { meetingId, requesterUserId };
};
