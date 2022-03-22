import Logger from '/imports/startup/server/logger';
import { LayoutMeetings } from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function changeLayout(payload) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'BroadcastLayoutMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const m = LayoutMeetings.findOne({ meetingId }) || {};
    const { presentationIsOpen, isResizing, cameraPosition, focusedCamera, presentationVideoRate } = m;

    const defaultPayload = { presentationIsOpen, isResizing, cameraPosition, focusedCamera, presentationVideoRate, ...payload};

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, defaultPayload);
  } catch (err) {
    Logger.error(`Exception while invoking method changeLayout ${err.stack}`);
  }
}
