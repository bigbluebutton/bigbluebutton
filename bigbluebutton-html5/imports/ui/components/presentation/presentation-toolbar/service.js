import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import Slides from '/imports/api/slides';
import { makeCall } from '/imports/ui/services/api/index.js';

const getSlideData = (params) => {
  const { currentSlideNum, presentationId } = params;

  // Get userId and meetingId
  const userId = AuthSingleton.userID;
  const meetingId = AuthSingleton.meetingID;

  // Find the user object of this specific meeting and userid
  const currentUser = Users.findOne({
    meetingId,
    userId,
  });

  let userIsPresenter;
  if (currentUser && currentUser.user) {
    userIsPresenter = currentUser.user.presenter;
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
    makeCall('switchSlideMessage', currentSlideNum - 1);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides) => {
  if (currentSlideNum < numberOfSlides) {
    makeCall('switchSlideMessage', currentSlideNum + 1);
  }
};

const skipToSlide = (event) => {
  const requestedSlideNum = parseInt(event.target.value);
  makeCall('switchSlideMessage', requestedSlideNum);
};

export default {
  getSlideData,
  nextSlide,
  previousSlide,
  skipToSlide,
};
