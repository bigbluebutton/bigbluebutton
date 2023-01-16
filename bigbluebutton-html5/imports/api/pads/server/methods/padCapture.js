import Pads from '/imports/api/pads';
import Breakouts from '/imports/api/breakouts';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function padCapture(breakoutId, parentMeetingId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadCapturePubMsg';
  const EXTERNAL_ID = Meteor.settings.public.notes.id;

  try {
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

    const breakout = Breakouts.findOne({ breakoutId });

    if (pad?.padId && breakout?.shortName) {
      const payload = {
        parentMeetingId,
        breakoutId,
        padId: pad.padId,
        filename: `${breakout.shortName}-notes`,
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
