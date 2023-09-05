import { check } from 'meteor/check';
import setPresentationDownloadable from '../modifiers/setPresentationDownloadable';

export default async function handlePresentationDownloadableSet({ body }, meetingId) {
  check(body, Object);

  const {
    presentationId, podId, downloadable, downloadableExtension,
  } = body;

  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);
  check(downloadableExtension, String);

  const result = await setPresentationDownloadable(meetingId, podId, presentationId, downloadable,
    downloadableExtension);
  return result;
}
