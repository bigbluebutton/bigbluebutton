import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default async function removePresentation(meetingId, podId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };

  try {
    const numberAffected = await Presentations.removeAsync(selector);

    if (numberAffected) {
      Logger.info(`Removed presentation id=${presentationId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Removing presentation from collection: ${err}`);
  }
}
