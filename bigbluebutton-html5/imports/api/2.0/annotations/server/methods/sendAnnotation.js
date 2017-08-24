import Acl from '/imports/startup/acl';
import { getMultiUserStatus } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis2x';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function sendAnnotation(credentials, annotation) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(annotation, Object);

  if (Acl.can('methods.sendAnnotation', credentials) || getMultiUserStatus(meetingId)) {
    const header = {
      name: EVENT_NAME,
      meetingId,
      userId: requesterUserId,
    };

    const payload = {
      annotation,
    };

    return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
  }

  throw new Meteor.Error(
    'not-allowed', `User ${requesterUserId} is not allowed to send an annotation`,
  );
}
