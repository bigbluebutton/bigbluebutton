import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import checkAnnotation from '../helpers/checkAnnotation';

function modifyWhiteboardAnnotations(annotations, whiteBoardId, action, meetingId, userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ModifyWhiteboardAnnotationPubMsg';

  try {
    check(meetingId, String);
    check(userId, String);

    check(whiteBoardId, String);
    check(action, String);

    check(annotations, [Match.Any]);
    annotations.forEach((annotation) => checkAnnotation(annotation));

    const payload = {
      annotations, userId, whiteBoardId, action,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method undoAnnotation ${err.stack}`);
  }
}

export default function deleteWhiteboardAnnotations(annotations, whiteboardId) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  modifyWhiteboardAnnotations(annotations, whiteboardId, 'delete', meetingId, requesterUserId);
}
