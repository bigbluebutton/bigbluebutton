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
    fileStateType,
  } = body;

  check(annotatedFileURI, String);
  check(originalFileURI, String);
  check(convertedFileURI, String);
  check(presId, String);
  check(fileStateType, String);

  if (fileStateType === 'Original' || fileStateType === 'Converted') {
    if (fileStateType === 'Converted') {
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
    await sendExportedPresentationChatMsg(meetingId, presId, annotatedFileURI, fileStateType);
  }
  await setPresentationExporting(meetingId, presId, { status: 'EXPORTED' });
}
