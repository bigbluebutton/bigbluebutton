import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

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

export const processForHTML5ServerOnly = (fn) => async (message, ...args) => {
  const { envelope } = message;
  const { routing } = envelope;
  const { msgType, meetingId, userId } = routing;

  const selector = {
    userId,
    meetingId,
  };

  const user = await Users.findOneAsync(selector);

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

// Creates a background job to periodically check the result of the provided function.
// The provided function is publication-specific and must check the "survival condition" of the publication.
export const publicationSafeGuard = function (fn, self) {
  let stopped = false;
  const periodicCheck = async function () {
    if (stopped) return;
    const result = await fn();
    if (!result) {
      self.added(self._name, 'publication-stop-marker', { id: 'publication-stop-marker', stopped: true });
      self.stop();
    } else Meteor.setTimeout(periodicCheck, 1000);
  };

  self.onStop(() => {
    stopped = true;
    Logger.info(`Publication ${self._name} has stopped in server side`);
  });

  periodicCheck();
};
