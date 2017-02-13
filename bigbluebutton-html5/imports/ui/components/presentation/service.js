import Presentations from '/imports/api/presentations';
import Shapes from '/imports/api/shapes';
import Slides from '/imports/api/slides';
import Cursor from '/imports/api/cursor';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const getCurrentPresentation = () => Presentations.findOne({
  'presentation.current': true,
});

const getCurrentSlide = () => {
  const currentPresentation = getCurrentPresentation();

  if (!currentPresentation) {
    return null;
  }

  return Slides.findOne({
    presentationId: currentPresentation.presentation.id,
    'slide.current': true,
  });
};

const getCurrentShapes = () => {
  const currentSlide = getCurrentSlide();

  if (!currentSlide) {
    return null;
  }

  return Shapes.find({
    whiteboardId: currentSlide.slide.id,
  }).fetch();
};

const getCurrentCursor = () => Cursor.findOne({});

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID, });

  if (currentUser && currentUser.user) {
    return currentUser.user.presenter;
  }

  return false;
};

export default {
  getCurrentPresentation,
  getCurrentSlide,
  getCurrentShapes,
  getCurrentCursor,
  isPresenter,
};
