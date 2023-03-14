import { check } from 'meteor/check';
import setPresentationDownloadable from '../modifiers/setPresentationDownloadable';

export default async function handlePresentationDownloadableSet({ body }, meetingId) {
  check(body, Object);

  const { presentationId, podId, downloadable } = body;

  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);

  const result = await setPresentationDownloadable(meetingId, podId, presentationId, downloadable);
  return result;
}
