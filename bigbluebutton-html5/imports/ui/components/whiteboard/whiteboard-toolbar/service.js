import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/2.0/whiteboard-multi-user/';

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
    const _drawSettings = Storage.getItem('drawSettings');
    if (!_drawSettings) {
      const drawSettings = {
        whiteboardAnnotationTool: tool,
        whiteboardAnnotationThickness: thickness,
        whiteboardAnnotationColor: color,
        textFontSize: fontSize,
        textShape,
      };
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setTool: (tool) => {
    const drawSettings = Storage.getItem('drawSettings');
    if (drawSettings) {
      drawSettings.whiteboardAnnotationTool = tool;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setThickness: (thickness) => {
    const drawSettings = Storage.getItem('drawSettings');
    if (drawSettings) {
      drawSettings.whiteboardAnnotationThickness = thickness;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setColor: (color) => {
    const drawSettings = Storage.getItem('drawSettings');
    if (drawSettings) {
      drawSettings.whiteboardAnnotationColor = color;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setFontSize: (fontSize) => {
    const drawSettings = Storage.getItem('drawSettings');
    if (drawSettings) {
      drawSettings.textFontSize = fontSize;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  getCurrentDrawSettings: () => Storage.getItem('drawSettings'),

  setTextShapeObject: (textShape) => {
    const drawSettings = Storage.getItem('drawSettings');
    if (drawSettings) {
      drawSettings.textShape = textShape;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },
};

const getTextShapeActiveId = () => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
    return drawSettings.textShape.textShapeActiveId;
  }

  return '';
};

const getMultiUserStatus = () => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID });

  if (data) {
    return data.multiUser;
  }

  return false;
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID });

  if (currentUser) {
    return currentUser.presenter;
  }

  return false;
};

export default {
  actions,
  getTextShapeActiveId,
  getMultiUserStatus,
  isPresenter,
};
