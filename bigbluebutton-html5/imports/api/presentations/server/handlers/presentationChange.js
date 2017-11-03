import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Presentations from '/imports/api/presentations';

import addPresentation from '../modifiers/addPresentation';

const clearCurrentPresentation = (meetingId, presentationId) => {
  const selector = {
    meetingId,
    presentationId: { $ne: presentationId },
    current: true,
  };

  const modifier = {
    $set: { current: false },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Unsetting the current presentation: ${err}`);
    }

    if (numChanged) {
      return Logger.info('Unset as current presentation');
    }

    return Logger.info('None presentation to unset');
  };

  return Presentations.update(selector, modifier, cb);
};

export default function handlePresentationChange({ header, body }) {
  const { meetingId } = header;
  const { presentation } = body;

  check(meetingId, String);
  check(presentation, Object);

  if (presentation.current) {
    clearCurrentPresentation(meetingId, presentation.id);
  }

  return addPresentation(meetingId, presentation);
}
