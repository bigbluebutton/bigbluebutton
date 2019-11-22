import Logger from '/imports/startup/server/logger';

const FLASH_STREAM_REGEX = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
const TOKEN = '_';

const isValidStream = (stream) => {
  // Checking if the stream name is a flash one
  return !FLASH_STREAM_REGEX.test(stream);
};

const getDeviceId = (stream) => {
  const splitStream = stream.split(TOKEN);
  if (splitStream.length === 3) return splitStream[2];
  Logger.warn(`Could not get deviceId from stream=${stream}`);
  return stream;
};

export {
  isValidStream,
  getDeviceId,
};
