import _ from 'lodash';
import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function sendAnnotationHelper(annotations, meetingId, requesterUserId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationsPubMsg';

  try {
    check(annotations, Array);
    // TODO see if really necessary, don't know if it's possible
    // to have annotations from different pages
    // group annotations by same whiteboardId
    _.each(_.groupBy(annotations, "wbId"), (whiteboardAnnotations) => {
      const whiteboardId = whiteboardAnnotations[0].wbId;
      check(whiteboardId, String);

      const payload = {
        whiteboardId,
        annotations: whiteboardAnnotations,
        html5InstanceId: parseInt(process.env.INSTANCE_ID, 10) || 1,
      };
  
      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    });

  } catch (err) {
    Logger.error(`Exception while invoking method sendAnnotationHelper ${err.stack}`);
  }
}
