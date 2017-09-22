import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';

export default function handlePresentationConversionDone({ body }, meetingId) {
  const presentationId = body.presentationId;
  const status = body.messageKey;

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
    id: presentationId,
  };

  const modifier = {
    $set: Object.assign({ meetingId }, statusModifier),
  };

  return Presentations.upsert(selector, modifier);
}
