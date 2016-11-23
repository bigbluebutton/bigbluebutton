import SlideControls from './component.jsx';
import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import Slides from '/imports/api/slides';
import { callServer } from '/imports/ui/services/api/index.js';

let getSlideData = (params) => {
  const { currentSlideNum, presentationId } = params;

  // Get userId and meetingId
  const userId = AuthSingleton.getCredentials().requesterUserId;
  const meetingId = AuthSingleton.getCredentials().meetingId;

  // Find the user object of this specific meeting and userid
  const currentUser = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });

  let userIsPresenter;
  if (currentUser && currentUser.user) {
    userIsPresenter = currentUser.user.presenter;
  }

  // Get total number of slides in this presentation
  const numberOfSlides = Slides.find({
    meetingId: meetingId,
    presentationId: presentationId,
  }).fetch().length;

  return {
    userIsPresenter: userIsPresenter,
    numberOfSlides: numberOfSlides,
  };
};

const previousSlide = (currentSlideNum) => {
  if (currentSlideNum > 1) {
    callServer('switchSlideMessage', currentSlideNum - 1);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides) => {
  if (currentSlideNum < numberOfSlides) {
    callServer('switchSlideMessage', currentSlideNum + 1);
  }
};

const skipToSlide = (event) => {
  const requestedSlideNum = parseInt(event.target.value);
  callServer('switchSlideMessage', requestedSlideNum);
};

export default {
  getSlideData,
  nextSlide,
  previousSlide,
  skipToSlide,
};
