import { check } from 'meteor/check';
import Pads from '/imports/api/pads';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function padCapture(breakoutId, parentMeetingId, meetingName) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadCapturePubMsg';
  const EXTERNAL_ID = Meteor.settings.public.notes.id;
  try {
    check(breakoutId, String);
    check(parentMeetingId, String);
    check(meetingName, String);

    const pad = Pads.findOne(
      {
        meetingId: breakoutId,
        externalId: EXTERNAL_ID,
      },
      {
        fields: {
          padId: 1,
        },
      },
    );

    if (pad && pad.padId) {
      const payload = {
        parentMeetingId,
        breakoutId,
        padId: pad.padId,
        filename: meetingName,
      };

      Logger.info(`Sending PadCapturePubMsg for meetingId=${breakoutId} parentMeetingId=${parentMeetingId} padId=${pad.padId}`);
      return RedisPubSub.publishMeetingMessage(CHANNEL, EVENT_NAME, parentMeetingId, payload);
    }

    return null;
  } catch (err) {
    Logger.error(`Exception while invoking method padCapture ${err.stack}`);
    return null;
  }
}
