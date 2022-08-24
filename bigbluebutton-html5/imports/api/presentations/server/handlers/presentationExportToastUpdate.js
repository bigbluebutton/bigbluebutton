import { check } from 'meteor/check';
import setPresentationExportingProgress from '/imports/api/presentations/server/modifiers/setPresentationExportingProgress';

export default function handlePresentationExportToastUpdate({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const {
    presId, pageNumber, totalPages, status, error,
  } = body;

  check(presId, String);
  check(pageNumber, Number);
  check(totalPages, Number);
  check(status, String);
  check(error, Boolean);

  setPresentationExportingProgress(meetingId, presId, {
    pageNumber, totalPages, status, error,
  });
}
