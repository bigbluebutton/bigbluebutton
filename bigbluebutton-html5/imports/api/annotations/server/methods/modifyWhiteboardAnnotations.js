import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import checkAnnotation from '../helpers/checkAnnotation';

export function modifyWhiteboardAnnotations(annotations, whiteboardId, action) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ModifyWhiteboardAnnotationPubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(meetingId, String);
    check(requesterUserId, String);

    check(whiteboardId, String);
    check(action, String);

    check(annotations, [Match.Any]);
    annotations.forEach((annotation) => checkAnnotation(annotation));

    const payload = {
      annotations, requesterUserId, whiteboardId, action,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method undoAnnotation ${err.stack}`);
  }
}

export function deleteWhiteboardAnnotations(annotations, whiteboardId) {
  modifyWhiteboardAnnotations(annotations, whiteboardId, 'delete');
}
