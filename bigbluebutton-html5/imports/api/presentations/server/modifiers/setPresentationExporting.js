import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setPresentationExporting(meetingId, presentationId, exportation) {
  check(meetingId, String);
  check(presentationId, String);
  check(exportation, Object);

  const selector = {
    meetingId,
    id: presentationId,
  };

  const modifier = {
    $set: {
      exportation,
    },
  };

  try {
    const { numberAffected } = Presentations.upsert(selector, modifier);

    if (numberAffected) {
      const status = `isRunning=${exportation.isRunning} error=${exportation.error}`;
      Logger.info(`Set exporting status on presentation ${presentationId} in meeting ${meetingId} ${status}`);
    }
  } catch (err) {
    Logger.error(`Could not set exporting status on pres ${presentationId} in meeting ${meetingId} ${err}`);
  }
}
