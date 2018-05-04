import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Meeting from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';

export default function userShareWebcam(credentials, message) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserBroadcastCamStartMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  Logger.info(' user sharing webcam: ', credentials);

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  // check(message, Object);

  // const actionName = 'joinVideo';
  /* TODO throw an error if user has no permission to share webcam
  if (!isAllowedTo(actionName, credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to share webcam`);
  } */

  const meeting = Meeting.findOne({meetingId});
  const stream = meeting.recordProp.record ? message + '-recorded' : message;

  const payload = {
    stream,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
