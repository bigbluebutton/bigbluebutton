import { isAllowedTo } from '/imports/startup/server/userPermissions';
import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

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

  let payload = {
    meeting_id: currentPoll.meetingId,
    presentation_id: presentationId,
    share: shouldShare,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
