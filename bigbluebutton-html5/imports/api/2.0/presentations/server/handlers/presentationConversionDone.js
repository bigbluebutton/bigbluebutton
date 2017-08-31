import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';

export default function handlePresentationConversionDone({ payload }) {
  const meetingId = payload.meeting_id;
  const presentationId = payload.presentation.id;
  const status = payload.message_key;

  check(meetingId, String);
  check(presentationId, String);

  const statusModifier = {
    'conversion.status': status,
    'conversion.error': false,
    'conversion.done': true,
    'upload.date': new Date(),
  };

  const selector = {
    meetingId,
    'presentation.id': presentationId,
  };

  const modifier = {
    $set: Object.assign({ meetingId }, statusModifier),
  };

  return Presentations.upsert(selector, modifier);
}
