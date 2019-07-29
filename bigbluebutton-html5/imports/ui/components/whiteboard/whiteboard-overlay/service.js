import Storage from '/imports/ui/services/storage/session';
import Auth from '/imports/ui/services/auth';
import { sendAnnotation, addAnnotationToDiscardedList } from '/imports/ui/components/whiteboard/service';
import { publishCursorUpdate } from '/imports/ui/components/cursor/service';

const DRAW_SETTINGS = 'drawSettings';

const getWhiteboardToolbarValues = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (!drawSettings) {
    return {};
  }

  const {
    whiteboardAnnotationTool,
    whiteboardAnnotationThickness,
    whiteboardAnnotationColor,
    textFontSize,
    textShape,
  } = drawSettings;

  return {
    tool: whiteboardAnnotationTool,
    thickness: whiteboardAnnotationThickness,
    color: whiteboardAnnotationColor,
    textFontSize,
    textShapeValue: textShape.textShapeValue ? textShape.textShapeValue : '',
    textShapeActiveId: textShape.textShapeActiveId ? textShape.textShapeActiveId : '',
  };
};

const resetTextShapeSession = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings.textShape.textShapeValue = '';
    drawSettings.textShape.textShapeActiveId = '';
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const setTextShapeActiveId = (id) => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings.textShape.textShapeActiveId = id;
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const getCurrentUserId = () => Auth.userID;

const contextMenuHandler = event => event.preventDefault();

const updateCursor = (payload) => {
  publishCursorUpdate(payload);
};

export default {
  addAnnotationToDiscardedList,
  sendAnnotation,
  getWhiteboardToolbarValues,
  setTextShapeActiveId,
  resetTextShapeSession,
  getCurrentUserId,
  contextMenuHandler,
  updateCursor,
};
