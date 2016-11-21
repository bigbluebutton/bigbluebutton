import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function changeCurrentPresentation(meetingId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);

  const oldCurrent = {
    selector: {
      meetingId,
      'presentation.current': true,
    },
    modifier: {
      $set: { 'presentation.current': false },
    },
    callback: (err) => {
      if (err) {
        return Logger.error(`Unsetting the current presentation: ${err}`);
      }

      return Logger.info(`Unsetted as current presentation`);
    },
  };

  const newCurrent = {
    selector: {
      meetingId,
      'presentation.id': presentationId,
    },
    modifier: {
      $set: { 'presentation.current': true },
    },
    callback: (err) => {
      if (err) {
        return Logger.error(`Setting as current presentation id=${presentationId}: ${err}`);
      }

      return Logger.info(`Setted as current presentation id=${presentationId}`);
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
};
