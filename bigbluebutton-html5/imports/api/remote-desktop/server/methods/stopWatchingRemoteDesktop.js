import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopWatchingRemoteDesktop() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopRemoteDesktopMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const meeting = Meetings.findOne({ meetingId });
  if (!meeting || meeting.remoteDesktopUrl === null) return;

  Meetings.update({ meetingId }, { $set: { remoteDesktopUrl: null,
					   remoteDesktopPassword: null,
					   remoteDesktopOperators: null,
					 } });
  const payload = {};

  Logger.info(`User id=${requesterUserId} stopped sharing a remote desktop for meeting=${meetingId}`);

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
