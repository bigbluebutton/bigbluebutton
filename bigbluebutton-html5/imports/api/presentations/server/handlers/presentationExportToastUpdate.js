import { check } from 'meteor/check';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';

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

  setPresentationExporting(meetingId, presId, {
    pageNumber, totalPages, status, error,
  });
}
