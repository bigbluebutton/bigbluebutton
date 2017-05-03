import { isAllowedTo } from '/imports/startup/server/userPermissions';
import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function removePresentation(credentials, presentationId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.presentation;
  const EVENT_NAME = 'remove_presentation';

  if (!isAllowedTo('removePresentation', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to removePresentation`);
  }

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(presentationId, String);

  const currentPresentation = Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationId,
  });

  if (currentPresentation.name === 'default.pdf') {
    throw new Meteor.Error('not-allowed', `You are not allowed to remove the default slide`);
  }

  let payload = {
    meeting_id: meetingId,
    presentation_id: presentationId,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
