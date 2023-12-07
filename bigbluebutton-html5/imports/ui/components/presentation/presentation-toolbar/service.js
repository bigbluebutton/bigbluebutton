import { makeCall } from '/imports/ui/services/api';
import { throttle } from '/imports/utils/throttle';

const PAN_ZOOM_INTERVAL = Meteor.settings.public.presentation.panZoomInterval || 200;

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

const zoomSlide = throttle((currentSlideNum, widthRatio, heightRatio, xOffset, yOffset, presentationId) => {
  makeCall('zoomSlide', currentSlideNum, POD_ID, widthRatio, heightRatio, xOffset, yOffset, presentationId);
}, PAN_ZOOM_INTERVAL);

const skipToSlide = (requestedSlideNum, presentationId) => {
  makeCall('switchSlide', requestedSlideNum, POD_ID, presentationId);
};

export default {
  nextSlide,
  previousSlide,
  skipToSlide,
  zoomSlide,
};
