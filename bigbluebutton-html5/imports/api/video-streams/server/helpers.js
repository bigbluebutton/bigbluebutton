import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const FLASH_STREAM_REGEX = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
const TOKEN = '_';

const isValidStream = stream => !FLASH_STREAM_REGEX.test(stream);
const getDeviceId = (stream) => {
  const splitStream = stream.split(TOKEN);
  if (splitStream.length === 3) return splitStream[2];
  Logger.warn(`Could not get deviceId from stream=${stream}`);
  return stream;
};

const getUserName = (userId, meetingId) => {
  const user = Users.findOne(
    { userId, meetingId },
    { fields: { name: 1 } },
  );
  if (user) return user.name;
  return userId;
};

export {
  isValidStream,
  getDeviceId,
  getUserName,
};
