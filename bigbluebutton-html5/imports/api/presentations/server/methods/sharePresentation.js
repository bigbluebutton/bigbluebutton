import { isAllowedTo } from '/imports/startup/server/userPermissions';
import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';

export default function sharePresentation(credentials, presentationId, shouldShare = true) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.presentation;
  const EVENT_NAME = 'share_presentation';

  if (!isAllowedTo('sharePresentation', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to sharePresentation`);
  }

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(presentationId, String);
  check(shouldShare, Boolean);

  const currentPresentation = Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationId,
  });

  if (currentPresentation && currentPresentation.presentation.id === presentationId) return;

  let payload = {
    meeting_id: meetingId,
    presentation_id: presentationId,
    share: shouldShare,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
