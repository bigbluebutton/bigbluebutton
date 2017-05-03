import { callServer } from '/imports/ui/services/api/index.js';
import Storage from '/imports/ui/services/storage/session';

const undoAnnotation = () => {
  callServer('undoAnnotation');
};

const clearWhiteboard = () => {
  callServer('clearWhiteboard');
};

const setWhiteboardToolbarValues = (tool, thickness, color) => {
  Storage.setItem('whiteboardAnnotationTool', tool);
  Storage.setItem('whiteboardAnnotationThickness', thickness);
  Storage.setItem('whiteboardAnnotationColor', color);
};

export default {
  undoAnnotation,
  clearWhiteboard,
  setWhiteboardToolbarValues,
};
