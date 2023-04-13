import Pads, { PadsUpdates } from '/imports/api/pads';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default async function padCapture(breakoutId, parentMeetingId, filename) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadCapturePubMsg';
  const EVENT_NAME_ERROR = 'PresentationConversionUpdateSysPubMsg';
  const EXTERNAL_ID = Meteor.settings.public.notes.id;

  try {
    const pad = await Pads.findOneAsync(
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

    const update = await PadsUpdates.findOneAsync(
      {
        meetingId: breakoutId,
        externalId: EXTERNAL_ID,
      }, {
        fields: {
          rev: 1,
        },
      },
    );

    if (pad?.padId && update?.rev > 0) {
      const payload = {
        parentMeetingId,
        breakoutId,
        padId: pad.padId,
        filename,
      };
      Logger.info(`Sending PadCapturePubMsg for meetingId=${breakoutId} parentMeetingId=${parentMeetingId} padId=${pad.padId}`);
      return RedisPubSub.publishMeetingMessage(CHANNEL, EVENT_NAME, parentMeetingId, payload);
    }

    // Notify that no content is available
    const temporaryPresentationId = `${breakoutId}-notes`;
    const payload = {
      podId: 'DEFAULT_PRESENTATION_POD',
      messageKey: '204',
      code: 'not-used',
      presentationId: temporaryPresentationId,
      presName: filename,
      temporaryPresentationId,
    };

    Logger.info(`No notes available for capture in meetingId=${breakoutId} parentMeetingId=${parentMeetingId} padId=${pad.padId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME_ERROR, parentMeetingId, 'system', payload);
  } catch (err) {
    Logger.error(`Exception while invoking method padCapture ${err.stack}`);
    return null;
  }
}
