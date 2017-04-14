import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import changeCurrentSlide from '../modifiers/changeCurrentSlide';

export default function handleSlideChange({ payload }) {
  const meetingId = payload.meeting_id;
  const slide = payload.page;

  check(meetingId, String);
  check(slide, Object);

  const slideId = slide.id;
  const presentationId = slideId.split('/')[0];

  return changeCurrentSlide(meetingId, presentationId, slideId);
};
