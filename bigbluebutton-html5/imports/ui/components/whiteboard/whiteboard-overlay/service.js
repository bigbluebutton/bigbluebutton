import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';

const sendAnnotation = (annotation) => {
  makeCall('sendAnnotation', annotation);
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

const getTextShapeValue = () => {
  let textShapeValue = Storage.getItem('whiteboardTextShapeValue');
  return textShapeValue ? textShapeValue : '';
};

export default {
  sendAnnotation,
  getWhiteboardToolbarValues,
  getTextShapeValue,
};
