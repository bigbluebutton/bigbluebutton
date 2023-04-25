import { check } from 'meteor/check';
import changeCurrentSlide from '../modifiers/changeCurrentSlide';

export default async function handleSlideChange({ body }, meetingId) {
  const { pageId, presentationId, podId } = body;

  check(pageId, String);
  check(presentationId, String);
  check(podId, String);

  const result = await changeCurrentSlide(meetingId, podId, presentationId, pageId);
  return result;
}
