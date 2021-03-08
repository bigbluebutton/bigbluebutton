import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';

export default function endMeeting() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'LogoutAndEndMeetingCmdMsg';
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const endedBy = Users.findOne({
    meetingId,
    userId: requesterUserId,
  }, { fields: { name: 1 } });

  if (endedBy) {
    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        meetingEndedBy: endedBy.name,
      },
    };

    Meetings.update(selector, modifier);
  }

  const payload = {
    userId: requesterUserId,
  };
  Logger.warn(`Meeting '${meetingId}' is destroyed by '${requesterUserId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
