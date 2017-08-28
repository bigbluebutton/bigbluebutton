import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import Presentations from './../../';

import addPresentation from '../modifiers/addPresentation';
import removePresentation from '../modifiers/removePresentation';

export default function handlePresentationInfoReply({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const meetingId = payload.meeting_id;
  const presentations = payload.presentations;

  check(meetingId, String);
  check(presentations, Array);

  const presentationsIds = presentations.map(_ => _.id);
  const presentationsToRemove = Presentations.find({
    meetingId,
    'presentation.id': { $nin: presentationsIds },
  }).fetch();

  presentationsToRemove.forEach(p => removePresentation(meetingId, p.presentation.id));

  const presentationsAdded = [];
  presentations.forEach((presentation) => {
    presentationsAdded.push(addPresentation(meetingId, presentation));
  });

  return presentationsAdded;
}
