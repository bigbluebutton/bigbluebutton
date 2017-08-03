import { check } from 'meteor/check';
import Presentations from './../../';
import Logger from '/imports/startup/server/logger';

import clearSlidesPresentation from '/imports/api/1.1/slides/server/modifiers/clearSlidesPresentation';

export default function removePresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const selector = {
    meetingId,
    'presentation.id': presentationId,
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
