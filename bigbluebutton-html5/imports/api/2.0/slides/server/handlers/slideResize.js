import { check } from 'meteor/check';
import resizeSlide from '../modifiers/resizeSlide';

export default function handleSlideResize({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return resizeSlide(meetingId, body);
}
