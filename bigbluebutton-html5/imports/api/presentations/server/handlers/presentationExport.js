import { check } from 'meteor/check';
import sendExportedPresentationChatMsg from '/imports/api/presentations/server/handlers/sendExportedPresentationChatMsg';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';
import setOriginalUriDownload from '/imports/api/presentations/server/modifiers/setOriginalUriDownload';

export default async function handlePresentationExport({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const {
    annotatedFileURI,
    originalFileURI,
    convertedFileURI,
    presId,
    typeOfExport,
  } = body;

  check(annotatedFileURI, String);
  check(originalFileURI, String);
  check(convertedFileURI, String);
  check(presId, String);
  check(typeOfExport, String);

  if (typeOfExport.indexOf('Original') !== -1) {
    if (typeOfExport.indexOf('Converted') !== -1) {
      await setOriginalUriDownload(
        meetingId,
        presId,
        convertedFileURI,
      );
    } else {
      await setOriginalUriDownload(
        meetingId,
        presId,
        originalFileURI,
      );
    }
  } else {
    await sendExportedPresentationChatMsg(meetingId, presId, annotatedFileURI, typeOfExport);
  }
  await setPresentationExporting(meetingId, presId, { status: 'EXPORTED' });
}
