import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function set3dScene(multiUser, scene) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'Modify3dScenePubMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(scene, Object);

  const payload = {
    multiUser,
    scene,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
