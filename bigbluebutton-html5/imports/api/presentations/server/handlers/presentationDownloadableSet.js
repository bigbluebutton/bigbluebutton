import { check } from 'meteor/check';
import setPresentationDownloadable from '../modifiers/setPresentationDownloadable';

export default function handlePresentationDownloadableSet({ body }, meetingId) {
  check(body, Object);

  const { presentationId, podId, downloadable } = body;

  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(downloadable, Boolean);

  return setPresentationDownloadable(meetingId, podId, presentationId, downloadable);
}
