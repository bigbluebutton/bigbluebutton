import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import removePresentation from '../modifiers/removePresentation';

export default function handlePresentationRemove({ payload }) {
  const meetingId = payload.meeting_id;
  const presentationId = payload.presentation_id;

  check(meetingId, String);
  check(presentationId, String);

  return removePresentation(meetingId, presentationId);
};
