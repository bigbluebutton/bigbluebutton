import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default async function setPresentationDownloadable(meetingId, podId,
  presentationId, downloadable, extensionToBeDownloadable) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);
  check(extensionToBeDownloadable, String);

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };

  let downloadableExtension = extensionToBeDownloadable;
  if (!downloadable) {
    downloadableExtension = '';
  }
  const modifier = {
    $set: {
      downloadable,
      downloadableExtension,
    },
  };

  try {
    const { numberAffected } = await Presentations.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set downloadable status on presentation {${presentationId} in meeting {${meetingId}}`);
    }
  } catch (err) {
    Logger.error(`Could not set downloadable on pres {${presentationId} in meeting {${meetingId}} ${err}`);
  }
}
