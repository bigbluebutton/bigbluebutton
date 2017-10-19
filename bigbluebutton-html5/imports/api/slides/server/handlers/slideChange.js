import { check } from 'meteor/check';
import changeCurrentSlide from '../modifiers/changeCurrentSlide';

export default function handleSlideChange({ body }, meetingId) {
  const { pageId, presentationId } = body;

  check(pageId, String);
  check(presentationId, String);

  return changeCurrentSlide(meetingId, presentationId, pageId);
}
