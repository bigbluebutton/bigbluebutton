import { check } from 'meteor/check';
import Pads, { PadsUpdates } from '/imports/api/pads';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Presentations from '/imports/api/presentations';
import _ from 'lodash';

export default function padCapture(meetingId, parentMeetingId, meetingName) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PadCapturePubMsg';
  const EXTERNAL_ID = Meteor.settings.public.notes.id;
  try {
    check(meetingId, String);
    check(parentMeetingId, String);
    check(meetingName, String);

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

    const update = PadsUpdates.findOne(
      {
        meetingId,
        externalId: EXTERNAL_ID,
      }, {
        fields: {
          rev: 1,
        },
      },
    );

    const filename = `${meetingName}-notes`;
    const payload = {
      parentMeetingId,
      breakoutId: meetingId,
      padId: pad.padId,
      filename,
    };

    if (pad && pad.padId && update?.rev > 0) {
      Logger.info(`Sending PadCapturePubMsg for meetingId=${meetingId} parentMeetingId=${parentMeetingId} padId=${pad.padId}`);
      return RedisPubSub.publishMeetingMessage(CHANNEL, EVENT_NAME, parentMeetingId, payload);
    }

    // Notify that no content
    Presentations.insert({
      id: _.uniqueId(filename),
      meetingId: parentMeetingId,
      temporaryPresentationId: `${meetingId}-notes`,
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
