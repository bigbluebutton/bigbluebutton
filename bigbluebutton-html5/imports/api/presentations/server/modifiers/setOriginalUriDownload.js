import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default async function setOriginalUriDownload(meetingId, presentationId, fileURI) {
  check(meetingId, String);
  check(presentationId, String);
  check(fileURI, String);

  const selector = {
    meetingId,
    id: presentationId,
  };

  const modifier = {
    $set: {
      originalFileURI: fileURI,
    },
  };

  try {
    const { numberAffected } = await Presentations.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set URI for file ${presentationId} in meeting ${meetingId} URI=${fileURI}`);
    }
  } catch (err) {
    Logger.error(`Could not set URI for file ${presentationId} in meeting ${meetingId} ${err}`);
  }
}
