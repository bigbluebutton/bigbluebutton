import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setPresentationExportingProgress(meetingId, presentationId, exportation) {
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
    Presentations.upsert(selector, modifier);
  } catch (err) {
    const state = `pageNumber=${exportation.pageNumber} totalPages=${exportation.totalPages} status=${exportation.status} error=${exportation.error}`;
    Logger.error(`Could not update exporting progress for presentation ${presentationId} in meeting ${meetingId} ${state} ${err}`);
  }
}
