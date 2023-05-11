import { check } from 'meteor/check';
import sendExportedPresentationChatMsg from '/imports/api/presentations/server/handlers/sendExportedPresentationChatMsg';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';
import setOriginalUriDownload from '/imports/api/presentations/server/modifiers/setOriginalUriDownload';

export default async function handlePresentationExport({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { fileURI, presId, typeOfExport } = body;

  check(fileURI, String);
  check(presId, String);
  check(typeOfExport, String);

  if (typeOfExport === 'Original') {
    await setOriginalUriDownload(meetingId, presId, fileURI);
  } else {
    await sendExportedPresentationChatMsg(meetingId, presId, fileURI, typeOfExport);
  }
  await setPresentationExporting(meetingId, presId, { status: 'EXPORTED' });
}
