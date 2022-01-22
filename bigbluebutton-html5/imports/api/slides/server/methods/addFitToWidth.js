import { Slides } from '/imports/api/slides';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function addFitToWidth(presentationId, slideNumber, podId, fitToWidth) {

  try {
    const { meetingId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(podId, String);
    check(slideNumber, Number);
    check(fitToWidth, Boolean);

    const selector = {
      meetingId,
      podId,
      presentationId,
      num: slideNumber,
    };

    const modifier = {
      $set: {
        fitToWidth,
      }
    }

    Slides.upsert(selector, modifier);

  } catch (err) {
    Logger.error(`Exception while invoking method fitToWidth ${err.stack}`);
  }
}
