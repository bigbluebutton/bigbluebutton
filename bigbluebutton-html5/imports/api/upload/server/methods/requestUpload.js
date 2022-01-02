import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';

//export default function requestUpload(credentials, source, filename, timestamp) {
export default function requestUpload(source, filename, timestamp) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UploadRequestReqMsg';

  //const { meetingId, requesterUserId } = credentials;
const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);
  check(source, String);
  check(filename, String);
  check(timestamp, Number)

  const payload = {
    source,
    filename,
    timestamp,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
