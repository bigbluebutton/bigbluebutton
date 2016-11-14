import Logger from '/imports/startup/server/logger';
import Slides from '/imports/api/slides';
import { check } from 'meteor/check';
import resizeSlide from '../modifiers/resizeSlide';

export default function handleSlideResize({ payload }) {
  const meetingId = payload.meeting_id;
  const slide = payload.page;

  check(meetingId, String);
  check(slide, Object);

  const slideId = slide.id;
  const presentationId = slideId.split('/')[0];

  return resizeSlide(meetingId, presentationId, slideId, slide);
};
