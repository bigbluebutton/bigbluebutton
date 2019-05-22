import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setFitToWidth(meetingId, podId, presentationId, fitToWidth) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(fitToWidth, Boolean);

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };

  const modifier = {
    $set: {
      fitToWidth,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Could not set fit-to-width on pres {${presentationId} in meeting {${meetingId}} ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Set fit-to-width status on presentation {${presentationId} in meeting {${meetingId}}`);
    }
  };

  return Presentations.upsert(selector, modifier, cb);
}
