import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function sendAnnotationHelper(annotation, meetingId, requesterUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationPubMsg';

  const whiteboardId = annotation.wbId;

  check(annotation, Object);
  check(whiteboardId, String);

  if (annotation.annotationType === 'text') {
    check(annotation, {
      id: String,
      status: String,
      annotationType: String,
      annotationInfo: {
        x: Number,
        y: Number,
        fontColor: Number,
        calcedFontSize: Number,
        textBoxWidth: Number,
        text: String,
        textBoxHeight: Number,
        id: String,
        whiteboardId: String,
        status: String,
        fontSize: Number,
        dataPoints: String,
        type: String,
      },
      wbId: String,
      userId: String,
      position: Number,
    });
  } else {
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
  }

  const payload = {
    annotation,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
