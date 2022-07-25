import { check } from 'meteor/check';
import sendExportedPresentationChatMsg from '/imports/api/presentations/server/handlers/sendExportedPresentationChatMsg';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';

export default function handlePresentationExport({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { fileURI } = body;

  check(fileURI, String);

  const fileURL = new URL(fileURI);
  const path = fileURL.pathname;
  const presentationId = path.split('/')[5];

  check(presentationId, String);

  sendExportedPresentationChatMsg(meetingId, presentationId, fileURI);
  setPresentationExporting(meetingId, presentationId, { status: 'EXPORTED' });
}
