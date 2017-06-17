import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const setTextShapeValue = (text) => {
  let drawSettings = Storage.getItem('drawSettings');
  if(drawSettings) {
    drawSettings.textShape.textShapeValue = text;
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  }
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID, });

  if (currentUser && currentUser.user) {
    return currentUser.user.presenter;
  }

  return false;
};

const activeTextShapeId = () => {
  let drawSettings = Storage.getItem('drawSettings');

  if(drawSettings) {
    return drawSettings.textShape.textShapeActiveId;
  }
}

export default {
  setTextShapeValue,
  activeTextShapeId,
  isPresenter,
};
