import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setPresentationDownloadable(meetingId, podId,
  presentationId, downloadable) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };

  const modifier = {
    $set: {
      downloadable,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Could not set downloadable on pres {${presentationId} in meeting {${meetingId}} ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Set downloadable status on presentation {${presentationId} in meeting {${meetingId}}`);
    }
  };

  return Presentations.upsert(selector, modifier, cb);
}
