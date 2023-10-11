import { makeCall } from '/imports/ui/services/api';
import { throttle } from '/imports/utils/throttle';

const PAN_ZOOM_INTERVAL = Meteor.settings.public.presentation.panZoomInterval || 200;

const POD_ID = 'DEFAULT_PRESENTATION_POD';

const previousSlide = (currentSlideNum) => {
  if (currentSlideNum > 1) {
    makeCall('switchSlide', currentSlideNum - 1, POD_ID);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides) => {
  if (currentSlideNum < numberOfSlides) {
    makeCall('switchSlide', currentSlideNum + 1, POD_ID);
  }
};

const zoomSlide = throttle((currentSlideNum, widthRatio, heightRatio, xOffset, yOffset) => {
  makeCall('zoomSlide', currentSlideNum, POD_ID, widthRatio, heightRatio, xOffset, yOffset);
}, PAN_ZOOM_INTERVAL);

const skipToSlide = (requestedSlideNum) => {
  makeCall('switchSlide', requestedSlideNum, POD_ID);
};

export default {
  nextSlide,
  previousSlide,
  skipToSlide,
  zoomSlide,
};
