import { callServer } from '/imports/ui/services/api/index.js';
import Storage from '/imports/ui/services/storage/session';

const sendAnnotation = (annotation) => {
  callServer('sendAnnotation', annotation);
};

const getWhiteboardToolbarValues = () => {
  let drawSettings = Storage.getItem('drawSettings');
  if(drawSettings) {
    return {
      tool: drawSettings.whiteboardAnnotationTool,
      thickness: drawSettings.whiteboardAnnotationThickness,
      color: drawSettings.whiteboardAnnotationColor,
      textFontSize: drawSettings.textFontSize,
    };
  }
};

export default {
  sendAnnotation,
  getWhiteboardToolbarValues,
};
