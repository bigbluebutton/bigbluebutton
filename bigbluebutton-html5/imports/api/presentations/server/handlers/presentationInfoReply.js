import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';

import addPresentation from '../modifiers/addPresentation';

export default function handlePresentationInfoReply({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const meetingId = payload.meeting_id;
  const presentations = payload.presentations;

  check(meetingId, String);
  check(presentations, Array);

  let presentationsAdded = [];
  presentations.forEach(presentation => {
    presentationsAdded.push(addPresentation(meetingId, presentation));
  });

  return presentationsAdded;
};
