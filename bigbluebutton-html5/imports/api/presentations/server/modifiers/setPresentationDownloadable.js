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

  try {
    const { numberAffected } = Presentations.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set downloadable status on presentation {${presentationId} in meeting {${meetingId}}`);
    }
  } catch (err) {
    Logger.error(`Could not set downloadable on pres {${presentationId} in meeting {${meetingId}} ${err}`);
  }
}
