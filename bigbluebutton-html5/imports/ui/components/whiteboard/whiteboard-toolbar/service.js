import { callServer } from '/imports/ui/services/api/index.js';
import Storage from '/imports/ui/services/storage/session';

const undoAnnotation = (whiteboardId) => {
  callServer('undoAnnotation', whiteboardId);
};

const clearWhiteboard = (whiteboardId) => {
  callServer('clearWhiteboard', whiteboardId);
};

const setWhiteboardToolbarValues = (tool, thickness, color, fontSize) => {
  let drawSettings = {
    whiteboardAnnotationTool: tool,
    whiteboardAnnotationThickness: thickness,
    whiteboardAnnotationColor: color,
    textFontSize: fontSize,
  };
  Storage.setItem('drawSettings', JSON.stringify(drawSettings));
};

export default {
  undoAnnotation,
  clearWhiteboard,
  setWhiteboardToolbarValues,
};
