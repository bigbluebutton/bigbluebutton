import { makeCall } from '/imports/ui/services/api';
import Storage from '/imports/ui/services/storage/session';


const actions = {
  undoAnnotation: (whiteboardId) => {
    makeCall('undoAnnotation', whiteboardId);
  },

  clearWhiteboard: (whiteboardId) => {
    makeCall('clearWhiteboard', whiteboardId);
  },

  setWhiteboardToolbarValues: (tool, thickness, color, fontSize, textShape) => {
    let drawSettings = {
      whiteboardAnnotationTool: tool,
      whiteboardAnnotationThickness: thickness,
      whiteboardAnnotationColor: color,
      textFontSize: fontSize,
      textShape: textShape,
    };
    Storage.setItem('drawSettings', JSON.stringify(drawSettings));
  },

  setTool: (tool) => {
    let drawSettings = Storage.getItem('drawSettings');
    if(drawSettings) {
      drawSettings.whiteboardAnnotationTool = tool;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }

  },

  setThickness: (thickness) => {
    let drawSettings = Storage.getItem('drawSettings');
    if(drawSettings) {
      drawSettings.whiteboardAnnotationThickness = thickness;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setColor: (color) => {
    let drawSettings = Storage.getItem('drawSettings');
    if(drawSettings) {
      drawSettings.whiteboardAnnotationColor = color;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setFontSize: (fontSize) => {
    let drawSettings = Storage.getItem('drawSettings');
    if(drawSettings) {
      drawSettings.textFontSize = fontSize;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },

  setTextShapeObject: (textShape) => {
    let drawSettings = Storage.getItem('drawSettings');
    if(drawSettings) {
      drawSettings.textShape = textShape;
      Storage.setItem('drawSettings', JSON.stringify(drawSettings));
    }
  },
};

const getTextShapeActiveId = () => {
  let drawSettings = Storage.getItem('drawSettings');
  if(drawSettings) {
    return drawSettings.textShape.textShapeActiveId;
  }
};

export default {
  actions,
  getTextShapeActiveId,
};
