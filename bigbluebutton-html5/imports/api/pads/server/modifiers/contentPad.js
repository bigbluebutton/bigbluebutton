import { check } from 'meteor/check';
import { patch } from '@mconf/bbb-diff';
import { PadsUpdates } from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

export default async function contentPad(meetingId, externalId, start, end, text) {
  try {
    check(meetingId, String);
    check(externalId, String);
    check(start, Number);
    check(end, Number);
    check(text, String);

    const selector = {
      meetingId,
      externalId,
    };

    const pad = await PadsUpdates.findOneAsync(selector);
    const content = (pad && pad.content) ? pad.content : '';

    const modifier = {
      $set: {
        content: patch(content, { start, end, text }),
      },
    };

    await PadsUpdates.upsertAsync(selector, modifier);
    Logger.debug(`Added pad content external=${externalId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Adding pad content to the collection: ${err}`);
  }
}
