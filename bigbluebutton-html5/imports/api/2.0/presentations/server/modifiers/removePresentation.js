import { check } from 'meteor/check';
import Presentations from '/imports/api/2.0/presentations';
import Logger from '/imports/startup/server/logger';

import clearSlidesPresentation from '/imports/api/2.0/slides/server/modifiers/clearSlidesPresentation';

export default function removePresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    id: presentationId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing presentation from collection: ${err}`);
    }

    if (numChanged) {
      clearSlidesPresentation(meetingId, presentationId);
      return Logger.info(`Removed presentation id=${presentationId} meeting=${meetingId}`);
    }
  };

  return Presentations.remove(selector, cb);
}
