import AuthSingleton from '/imports/ui/services/auth';
import Users from '/imports/api/2.0/users';
import Slides from '/imports/api/2.0/slides';
import { makeCall } from '/imports/ui/services/api';

const getSlideData = (params) => {
  const { presentationId } = params;

  // Get userId and meetingId
  const userId = AuthSingleton.userID;
  const meetingId = AuthSingleton.meetingID;

  // Find the user object of this specific meeting and userid
  const currentUser = Users.findOne({
    meetingId,
    userId,
  });

  let userIsPresenter;
  if (currentUser) {
    userIsPresenter = currentUser.presenter;
  }

  // Get total number of slides in this presentation
  const numberOfSlides = Slides.find({
    meetingId,
    presentationId,
  }).fetch().length;

  return {
    userIsPresenter,
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
  const requestedSlideNum = parseInt(event.target.value);
  makeCall('switchSlide', requestedSlideNum);
};

export default {
  getSlideData,
  nextSlide,
  previousSlide,
  skipToSlide,
};
