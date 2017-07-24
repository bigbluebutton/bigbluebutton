import { check } from 'meteor/check';
import Presentations from '/imports/api/2.0/presentations';
import Logger from '/imports/startup/server/logger';

export default function changeCurrentPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const oldCurrent = {
    selector: {
      meetingId,
      current: true,
    },
    modifier: {
      $set: { current: false },
    },
    callback: (err) => {
      if (err) {
        return Logger.error(`Unsetting the current presentation: ${err}`);
      }

      return Logger.info('Unsetted as current presentation');
    },
  };

  const newCurrent = {
    selector: {
      meetingId,
      id: presentationId,
    },
    modifier: {
      $set: { current: true },
    },
    callback: (err) => {
      if (err) {
        return Logger.error(`Setting as current presentation2x id=${presentationId}: ${err}`);
      }

      return Logger.info(`Setted as current presentation2x id=${presentationId}`);
    },
  };

  const oldPresentation = Presentations.findOne(oldCurrent.selector);
  const newPresentation = Presentations.findOne(newCurrent.selector);

  if (newPresentation) {
    Presentations.update(newPresentation._id, newCurrent.modifier, newCurrent.callback);
  }

  if (oldPresentation) {
    Presentations.update(oldPresentation._id, oldCurrent.modifier, oldCurrent.callback);
  }
}
