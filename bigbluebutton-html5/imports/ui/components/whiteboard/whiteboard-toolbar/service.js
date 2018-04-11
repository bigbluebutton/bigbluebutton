import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const DRAW_SETTINGS = 'drawSettings';

const makeSetter = key => (value) => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings[key] = value;
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const undoAnnotation = (whiteboardId) => {
  makeCall('undoAnnotation', whiteboardId);
};

const clearWhiteboard = (whiteboardId) => {
  makeCall('clearWhiteboard', whiteboardId);
};

const changeWhiteboardMode = (multiUser, whiteboardId) => {
  makeCall('changeWhiteboardAccess', multiUser, whiteboardId);
};

const setInitialWhiteboardToolbarValues = (tool, thickness, color, fontSize, textShape) => {
  const _drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (!_drawSettings) {
    const drawSettings = {
      whiteboardAnnotationTool: tool,
      whiteboardAnnotationThickness: thickness,
      whiteboardAnnotationColor: color,
      textFontSize: fontSize,
      textShape,
    };
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const getCurrentDrawSettings = () => Storage.getItem(DRAW_SETTINGS);

const setFontSize = makeSetter('textFontSize');

const setTool = makeSetter('whiteboardAnnotationTool');

const setThickness = makeSetter('whiteboardAnnotationThickness');

const setColor = makeSetter('whiteboardAnnotationColor');

const setTextShapeObject = makeSetter('textShape');

const getTextShapeActiveId = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  return drawSettings ? drawSettings.textShape.textShapeActiveId : '';
};

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : false;
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID });
  return currentUser ? currentUser.presenter : false;
};

export default {
  undoAnnotation,
  clearWhiteboard,
  changeWhiteboardMode,
  setInitialWhiteboardToolbarValues,
  getCurrentDrawSettings,
  setFontSize,
  setTool,
  setThickness,
  setColor,
  setTextShapeObject,
  getTextShapeActiveId,
  getMultiUserStatus,
  isPresenter,
};
