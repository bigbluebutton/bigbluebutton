import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';
import Auth from '/imports/ui/services/auth';

const sendAnnotation = (annotation) => {
  makeCall('sendAnnotation', annotation);
};

const getWhiteboardToolbarValues = () => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
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
  }
  return {};
};

const resetTextShapeSession = () => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
    drawSettings.textShape.textShapeValue = '';
    drawSettings.textShape.textShapeActiveId = '';
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  }
};

const setTextShapeActiveId = (id) => {
  const drawSettings = Storage.getItem('drawSettings');
  if (drawSettings) {
    drawSettings.textShape.textShapeActiveId = id;
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  }
};

const getCurrentUserId = () => Auth.userID;


export default {
  sendAnnotation,
  getWhiteboardToolbarValues,
  setTextShapeActiveId,
  resetTextShapeSession,
  getCurrentUserId,
};
