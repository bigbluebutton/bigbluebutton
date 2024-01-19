import { makeCall } from '/imports/ui/services/api';

const POD_ID = 'DEFAULT_PRESENTATION_POD';

const previousSlide = (currentSlideNum, presentationId) => {
  if (currentSlideNum > 1) {
    makeCall('switchSlide', currentSlideNum - 1, POD_ID, presentationId);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides, presentationId) => {
  if (currentSlideNum < numberOfSlides) {
    makeCall('switchSlide', currentSlideNum + 1, POD_ID, presentationId);
  }
};

const skipToSlide = (requestedSlideNum, presentationId) => {
  makeCall('switchSlide', requestedSlideNum, POD_ID, presentationId);
};

export default {
  nextSlide,
  previousSlide,
  skipToSlide,
};
