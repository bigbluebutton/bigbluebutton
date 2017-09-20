import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/2.0/whiteboard-multi-user/';


const DRAW_SETTINGS = 'drawSettings';

const makeSetter = key => (value) => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings[key] = value;
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const actions = {
  undoAnnotation: (whiteboardId) => {
    makeCall('undoAnnotation', whiteboardId);
  },

  clearWhiteboard: (whiteboardId) => {
    makeCall('clearWhiteboard', whiteboardId);
  },

  changeWhiteboardMode: (multiUser) => {
    makeCall('changeWhiteboardAccess', multiUser);
  },

  setInitialWhiteboardToolbarValues: (tool, thickness, color, fontSize, textShape) => {
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
  },

  getCurrentDrawSettings: () => Storage.getItem(DRAW_SETTINGS),

  setFontSize: makeSetter('textFontSize'),

  setTool: makeSetter('whiteboardAnnotationTool'),

  setThickness: makeSetter('whiteboardAnnotationThickness'),

  setColor: makeSetter('whiteboardAnnotationColor'),

  setTextShapeObject: makeSetter('textShape'),
};

const getTextShapeActiveId = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  return drawSettings ? drawSettings.textShape.textShapeActiveId : '';
};

const getMultiUserStatus = () => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID });
  return data ? data.multiUser : false;
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID });
  return currentUser ? currentUser.presenter : false;
};

export default {
  actions,
  getTextShapeActiveId,
  getMultiUserStatus,
  isPresenter,
};
