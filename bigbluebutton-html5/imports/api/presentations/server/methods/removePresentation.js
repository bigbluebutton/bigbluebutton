import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';

export default function removePresentation(credentials, presentationId) {
  const PRESENTATION_CONFIG = Meteor.settings.public.presentation;
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RemovePresentationPubMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(presentationId, String);

  const presentationToDelete = Presentations.findOne({
    meetingId,
    id: presentationId,
  });

  if (presentationToDelete.name === PRESENTATION_CONFIG.defaultPresentationFile) {
    throw new Meteor.Error('not-allowed', 'You are not allowed to remove the default slide');
  }

  const payload = {
    presentationId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
