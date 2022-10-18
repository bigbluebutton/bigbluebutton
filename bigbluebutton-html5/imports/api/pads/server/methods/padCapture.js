import { check } from 'meteor/check';
import Pads from '/imports/api/pads';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function padCapture(meetingId, parentMeetingId, meetingName, sequence) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadCapturePubMsg';
  const EXTERNAL_ID = Meteor.settings.public.notes.id;
  try {
    check(meetingId, String);
    check(parentMeetingId, String);
    check(meetingName, String);
    check(sequence, Number);

    const pad = Pads.findOne(
      {
        meetingId,
        externalId: EXTERNAL_ID,
      },
      {
        fields: {
          padId: 1,
        },
      },
    );

    const payload = {
      parentMeetingId,
      breakoutId: meetingId,
      padId: pad.padId,
      meetingName,
      sequence,
    };

    Logger.info(`Sending PadCapturePubMsg for meetingId=${meetingId} parentMeetingId=${parentMeetingId} padId=${pad.padId}`);

    if (pad && pad.padId) {
      return RedisPubSub.publishMeetingMessage(CHANNEL, EVENT_NAME, parentMeetingId, payload);
    }

    return null;
  } catch (err) {
    Logger.error(`Exception while invoking method padCapture ${err.stack}`);
    return null;
  }
}
