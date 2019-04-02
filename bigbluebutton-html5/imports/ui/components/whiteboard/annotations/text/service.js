import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const DRAW_SETTINGS = 'drawSettings';

const setTextShapeValue = (text) => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings.textShape.textShapeValue = text;
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const resetTextShapeActiveId = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings.textShape.textShapeActiveId = '';
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID });
  return currentUser ? currentUser.presenter : false;
};

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : false;
};

const activeTextShapeId = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  return drawSettings ? drawSettings.textShape.textShapeActiveId : '';
};

export default {
  setTextShapeValue,
  activeTextShapeId,
  isPresenter,
  resetTextShapeActiveId,
  getMultiUserStatus,
};
