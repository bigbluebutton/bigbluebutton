import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/2.0/whiteboard-multi-user/';

const setTextShapeValue = (text) => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
    drawSettings.textShape.textShapeValue = text;
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  }
};

const resetTextShapeActiveId = () => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
    drawSettings.textShape.textShapeActiveId = '';
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  }
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID });

  if (currentUser) {
    return currentUser.presenter;
  }

  return false;
};

const getMultiUserStatus = () => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID });

  if (data) {
    return data.multiUser;
  }

  return false;
};

const activeTextShapeId = () => {
  const drawSettings = Storage.getItem('drawSettings');

  if (drawSettings) {
    return drawSettings.textShape.textShapeActiveId;
  }

  return '';
};

export default {
  setTextShapeValue,
  activeTextShapeId,
  isPresenter,
  resetTextShapeActiveId,
  getMultiUserStatus,
};
