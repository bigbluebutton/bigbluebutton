import RedisPubSub from '/imports/startup/server/redis2x';
import { check } from 'meteor/check';
import Presentations from '/imports/api/2.0/presentations';

export default function removePresentation(credentials, presentationId) {
  const PRESENTATION_CONFIG = Meteor.settings.public.presentation;
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RemovePresentationPubMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(presentationId, String);

  const presenationToDelete = Presentations.findOne({
    meetingId,
    id: presentationId,
  });

  if (presenationToDelete.name === PRESENTATION_CONFIG.defaultPresentationFile) {
    throw new Meteor.Error('not-allowed', 'You are not allowed to remove the default slide');
  }

  const payload = {
    presentationId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
