import SlideControls from './component.jsx';
import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import Slides from '/imports/api/slides';

let getSlideData = (params) => {
  const { currentSlideNum, presentationId } = params;

  //Get userId and meetingId
  const userId = AuthSingleton.getCredentials().requesterUserId;
  const meetingId = AuthSingleton.getCredentials().meetingId;

  //Find the user object of this specific meeting and userid
  const user = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });

  //Get total number of slides in this presentation
  const numberOfSlides = Slides.find({
    meetingId: meetingId,
    presentationId: presentationId,
  }).fetch().length;

  return {
    userIsPresenter: user.user.presenter,
    numberOfSlides: numberOfSlides,
  };
};

export default {
  getSlideData,
};
