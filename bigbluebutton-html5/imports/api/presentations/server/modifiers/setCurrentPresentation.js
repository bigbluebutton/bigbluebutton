import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setCurrentPresentation(meetingId, presentationId) {
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
        return Logger.error(`Setting as current presentation id=${presentationId}: ${err}`);
      }

      return Logger.info(`Setted as current presentation id=${presentationId}`);
    },
  };

  const oldPresentation = Presentations.findOne(oldCurrent.selector);
  const newPresentation = Presentations.findOne(newCurrent.selector);

  // Prevent bug with presentation being unset, same happens in the slide
  // See: https://github.com/bigbluebutton/bigbluebutton/pull/4431
  if (oldPresentation && newPresentation && (oldPresentation._id === newPresentation._id)) {
    return;
  }

  if (newPresentation) {
    Presentations.update(newPresentation._id, newCurrent.modifier, newCurrent.callback);
  }

  if (oldPresentation) {
    Presentations.update(oldPresentation._id, oldCurrent.modifier, oldCurrent.callback);
  }
}
