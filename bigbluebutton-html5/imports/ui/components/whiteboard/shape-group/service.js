import Shapes from '/imports/api/shapes';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const getCurrentShapes = (whiteboardId) => {

  if (!whiteboardId) {
    return null;
  }

  return Shapes.find({
    whiteboardId: whiteboardId,
  }).fetch();
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID, });

  if (currentUser && currentUser.user) {
    return currentUser.user.presenter;
  }

  return false;
};

export default {
  getCurrentShapes,
  isPresenter,
};
