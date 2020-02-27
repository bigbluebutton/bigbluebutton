import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function muteAllExceptPresenterToggle() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteAllExceptPresentersCmdMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const meeting = Meetings.findOne({ meetingId });
  const toggleMeetingMuted = !meeting.voiceProp.muteOnStart;

  const payload = {
    mutedBy: requesterUserId,
    mute: toggleMeetingMuted,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
