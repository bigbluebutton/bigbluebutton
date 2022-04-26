import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';

export default function setCurrentSlide(meetingId, slideNum) {
  try {
    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        activeSlide: slideNum,
      },
    };

    const activeUpdate = Meetings.update(selector, modifier);

    if (activeUpdate) {
      Logger.info(`Meeting active slide changed for meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setCurrentSlide ${err.stack}`);
  }
}
