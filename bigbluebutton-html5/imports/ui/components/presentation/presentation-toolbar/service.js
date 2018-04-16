import AuthSingleton from '/imports/ui/services/auth';
import Slides from '/imports/api/slides';
import { makeCall } from '/imports/ui/services/api';

const getSlideData = (presentationId) => {
  // Get userId and meetingId
  const meetingId = AuthSingleton.meetingID;

  // Get total number of slides in this presentation
  const numberOfSlides = Slides.find({
    meetingId,
    presentationId,
  }).fetch().length;

  return {
    numberOfSlides,
  };
};

const previousSlide = (currentSlideNum) => {
  if (currentSlideNum > 1) {
    makeCall('switchSlide', currentSlideNum - 1);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides) => {
  if (currentSlideNum < numberOfSlides) {
    makeCall('switchSlide', currentSlideNum + 1);
  }
};

const skipToSlide = (event) => {
  const requestedSlideNum = parseInt(event.target.value, 10);
  makeCall('switchSlide', requestedSlideNum);
};

export default {
  getSlideData,
  nextSlide,
  previousSlide,
  skipToSlide,
};
