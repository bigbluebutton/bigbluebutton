import Pads, { PadsUpdates } from '/imports/api/pads';
import Breakouts from '/imports/api/breakouts';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Presentations from '/imports/api/presentations';
import _ from 'lodash';

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

    const update = PadsUpdates.findOne(
      {
        breakoutId,
        externalId: EXTERNAL_ID,
      }, {
        fields: {
          rev: 1,
        },
      },
    );

    const filename = `${breakout?.shortName}-notes`;

    if (pad?.padId && update?.rev > 0 && breakout?.shortName) {
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
    Presentations.insert({
      id: _.uniqueId(filename),
      meetingId: parentMeetingId,
      temporaryPresentationId: `${breakoutId}-notes`,
      renderedInToast: false,
      lastModifiedUploader: false,
      filename,
      conversion: {
        done: false,
        error: true,
        status: 204,
      },
    });

    return null;
  } catch (err) {
    Logger.error(`Exception while invoking method padCapture ${err.stack}`);
    return null;
  }
}
