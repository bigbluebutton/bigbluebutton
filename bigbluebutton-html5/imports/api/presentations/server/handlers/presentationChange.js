import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Presentations from '/imports/api/presentations';

import addPresentation from '../modifiers/addPresentation';

const clearCurrentPresentation = (meetingId, presentationId) => {
  let selector = {
    meetingId,
    presentationId: { $ne: presentationId },
    'presentation.current': true,
  };

  let modifier = {
    $set: { 'presentation.current': false },
  };

  let cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Unsetting the current presentation: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Unsetted as current presentation`);
    }
  };

  return Presentations.update(selector, modifier, cb);
};

export default function handlePresentationChange({ payload }) {
  const meetingId = payload.meeting_id;
  const presentation = payload.presentation;

  check(meetingId, String);
  check(presentation, Object);

  // We need to clear the flag of the older current presentation ¯\_(ツ)_/¯
  if (presentation.current) {
    clearCurrentPresentation(meetingId, presentation.id);
  }

  return addPresentation(meetingId, presentation);
};
