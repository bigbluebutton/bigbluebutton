import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import checkAnnotation from '../helpers/checkAnnotation';

export default function sendAnnotationHelper(annotation, meetingId, requesterUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationPubMsg';

  try {
    checkAnnotation(annotation);

    const payload = {
      annotation,
      drawEndOnly: true,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method sendAnnotationHelper ${err.stack}`);
  }
}
