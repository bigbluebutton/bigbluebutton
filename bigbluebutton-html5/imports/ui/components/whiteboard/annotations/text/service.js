import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';

const setTextShapeValue = (text) => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
    drawSettings.textShape.textShapeValue = text;
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  }
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID });

  if (currentUser && currentUser.user) {
    return currentUser.user.presenter;
  }

  return false;
};

const activeTextShapeId = () => {
  const drawSettings = Storage.getItem('drawSettings');

  if (drawSettings) {
    return drawSettings.textShape.textShapeActiveId;
  }

  return undefined;
};

export default {
  setTextShapeValue,
  activeTextShapeId,
  isPresenter,
};
