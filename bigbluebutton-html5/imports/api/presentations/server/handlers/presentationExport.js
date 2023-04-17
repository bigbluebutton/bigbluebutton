import { check } from 'meteor/check';
import sendExportedPresentationChatMsg from '/imports/api/presentations/server/handlers/sendExportedPresentationChatMsg';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';

export default async function handlePresentationExport({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { fileURI, presId, typeOfExport } = body;

  check(fileURI, String);
  check(presId, String);
  check(typeOfExport, Match.Maybe(String));

  await sendExportedPresentationChatMsg(meetingId, presId, fileURI, typeOfExport);
  await setPresentationExporting(meetingId, presId, { status: 'EXPORTED' });
}
