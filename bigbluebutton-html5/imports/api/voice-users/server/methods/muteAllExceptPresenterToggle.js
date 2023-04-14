import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default async function muteAllExceptPresenterToggle() {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'MuteAllExceptPresentersCmdMsg';

    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const meeting = await Meetings.findOneAsync({ meetingId });
    const toggleMeetingMuted = !meeting.voiceProp.muteOnStart;

    const payload = {
      mutedBy: requesterUserId,
      mute: toggleMeetingMuted,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method muteAllExceptPresenterToggle ${err.stack}`);
  }
}
