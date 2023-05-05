import { check } from 'meteor/check';
import changeCurrentSlide from '../modifiers/changeCurrentSlide';

export default function handleSlideChange({ body }, meetingId) {
  const { pageId, presentationId, podId } = body;

  check(pageId, String);
  check(presentationId, String);
  check(podId, String);

  return changeCurrentSlide(meetingId, podId, presentationId, pageId);
}
