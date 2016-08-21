import Presentations from '/imports/api/presentations';
import Shapes from '/imports/api/shapes';
import Slides from '/imports/api/slides';
import Cursor from '/imports/api/cursor';
import Users from '/imports/api/users';
import AuthSingleton from '/imports/ui/services/auth/index.js';

let getWhiteboardData = () => {
  let currentSlide;
  let shapes;
  let cursor;
  let userIsPresenter;
  let currentPresentation = Presentations.findOne({
      'presentation.current': true,
    });

  if (currentPresentation != null) {
    currentSlide = Slides.findOne({
      presentationId: currentPresentation.presentation.id,
      'slide.current': true,
    });
  }

  if (currentSlide != null) {
    shapes = Shapes.find({
        whiteboardId: currentSlide.slide.id,
      }).fetch();

    cursor = Cursor.findOne({
      meetingId: currentSlide.meetingId,
    });

    // Get user to check if they are the presenter
    userIsPresenter = Users.findOne({
      meetingId: currentSlide.meetingId,
      userId: AuthSingleton.getCredentials().requesterUserId,
    }).user.presenter;
  }

  return {
    currentSlide: currentSlide,
    shapes: shapes,
    cursor: cursor,
    userIsPresenter: userIsPresenter,
  };
};

export default {
  getWhiteboardData,
};
