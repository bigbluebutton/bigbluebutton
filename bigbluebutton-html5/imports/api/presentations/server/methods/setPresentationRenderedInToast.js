import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default async function setPresentationRenderedInToast() {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const payload = {
      $set: { renderedInToast: true },
    };

    const numberAffected = await Presentations.updateAsync({
      renderedInToast: false,
      meetingId,
    }, payload, {multi: true});

    if (numberAffected) {
      Logger.info(`Presentations have been set as rendered in the toast within meeting=${meetingId}, ${numberAffected} documents affected.`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setPresentationRenderedInToast ${err.stack}`);
  }
}
