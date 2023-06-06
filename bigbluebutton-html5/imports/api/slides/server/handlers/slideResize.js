import { check } from 'meteor/check';
import resizeSlide from '../modifiers/resizeSlide';

export default async function handleSlideResize({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const result = await resizeSlide(meetingId, body);
  return result;
}
