import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function sendEraserHelper(annotation, meetingId, requesterUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardEraserPubMsg';

  try {
    const whiteboardId = annotation.wbId;

    check(annotation, Object);
    check(whiteboardId, String);

    check(annotation, {
    id: String,
    status: String,
    annotationType: String,
    annotationInfo: {
        color: Number,
        thickness: Number,
        points: Array,
        id: String,
        whiteboardId: String,
        status: String,
        type: String,
        dimensions: Match.Maybe([Number]),
    },
    wbId: String,
    userId: String,
    position: Number,
    });
    

    const payload = {
      annotation,
      drawEndOnly: true,
    };
    
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method sendEraserHelper ${err.stack}`);
  }
}