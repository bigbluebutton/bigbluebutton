import PresentationPods from '/imports/api/presentation-pods';
import Auth from '/imports/ui/services/auth';
import Slides from '/imports/api/slides';
import { makeCall } from '/imports/ui/services/api';

const getSlideData = (podId, presentationId) => {
  // Get  meetingId and userId
  const meetingId = Auth.meetingID;
  const userId = Auth.userID;

  // fetching the presentation pod in order to see who owns it
  const selector = {
    meetingId,
    podId,
  };
  const pod = PresentationPods.findOne(selector);
  const userIsPresenter = pod.currentPresenterId === userId;

  // Get total number of slides in this presentation
  const numberOfSlides = Slides.find({
    meetingId,
    podId,
    presentationId,
  }).fetch().length;

  return {
    userIsPresenter,
    numberOfSlides,
  };
};

const previousSlide = (currentSlideNum, podId) => {
  if (currentSlideNum > 1) {
    makeCall('switchSlide', currentSlideNum - 1, podId);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides, podId) => {
  if (currentSlideNum < numberOfSlides) {
    makeCall('switchSlide', currentSlideNum + 1, podId);
  }
};

const skipToSlide = (requestedSlideNum, podId) => {
  makeCall('switchSlide', requestedSlideNum, podId);
};

export default {
  getSlideData,
  nextSlide,
  previousSlide,
  skipToSlide,
};
