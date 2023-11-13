import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import setCurrentPresentation from './setCurrentPresentation';

export default async function addPresentation(meetingId, podId, presentation) {
  check(meetingId, String);
  check(podId, String);
  check(presentation, {
    id: String,
    name: String,
    current: Boolean,
    temporaryPresentationId: String,
    pages: [
      {
        id: String,
        num: Number,
        thumbUri: String,
        txtUri: String,
        svgUri: String,
        current: Boolean,
        xOffset: Number,
        yOffset: Number,
        widthRatio: Number,
        heightRatio: Number,
        width: Number,
        height: Number,
      },
    ],
    downloadable: Boolean,
    removable: Boolean,
    defaultPresentation: Boolean,
    filenameConverted: String,
  });

  const selector = {
    meetingId,
    podId,
    id: presentation.id,
  };

  const modifier = {
    $set: {
      meetingId,
      podId,
      'conversion.done': true,
      'conversion.error': false,
      'exportation.status': null,
      ...flat(presentation, { safe: true }),
    },
  };

  try {
    await Presentations.upsertAsync(selector, modifier);

    if (presentation.current) {
      setCurrentPresentation(meetingId, podId, presentation.id);
      Logger.info(`Added presentation id=${presentation.id} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted presentation id=${presentation.id} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding presentation to collection: ${err}`);
  }
}
