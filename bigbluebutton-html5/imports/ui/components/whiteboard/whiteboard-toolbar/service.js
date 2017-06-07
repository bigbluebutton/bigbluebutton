import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';

const undoAnnotation = (whiteboardId) => {
  makeCall('undoAnnotation', whiteboardId);
};

const clearWhiteboard = (whiteboardId) => {
  makeCall('clearWhiteboard', whiteboardId);
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
