import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function setPresenterInPodReqMsg(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresenterInPodReqMsg';

  const { meetingId, requesterUserId, presenterId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(presenterId, String);

  const payload = {
    podId: 'DEFAULT_PRESENTATION_POD',
    nextPresenterId: presenterId,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
