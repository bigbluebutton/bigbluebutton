import RedisPubSub from '/imports/startup/server/redis2x';
import { check } from 'meteor/check';
import Presentations from '/imports/api/2.0/presentations';

export default function sharePresentation(credentials, presentationId, shouldShare = true) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPresentationPubMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(presentationId, String);
  check(shouldShare, Boolean);

  const currentPresentation = Presentations.findOne({
    meetingId,
    id: presentationId,
    current: true,
  });

  if (currentPresentation && currentPresentation.id === presentationId) {
    return Promise.resolve();
  }

  const payload = {
    presentationId,
  };

  const header = {
    meetingId,
    name: EVENT_NAME,
    userId: requesterUserId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
