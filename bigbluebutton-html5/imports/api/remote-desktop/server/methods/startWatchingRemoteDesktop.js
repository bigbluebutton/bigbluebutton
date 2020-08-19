import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startWatchingRemoteDesktop(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartRemoteDesktopMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const { remoteDesktopUrl } = options;

  check(remoteDesktopUrl, String);

  Meetings.update({ meetingId }, { $set: { remoteDesktopUrl } });

  const payload = { remoteDesktopUrl };

  Logger.info(`User id=${requesterUserId} sharing a remote desktop: ${remoteDesktopUrl} for meeting ${meetingId}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
