import { callServer } from '/imports/ui/services/api/index.js';
import Storage from '/imports/ui/services/storage/session';

const sendAnnotation = (annotation) => {
  callServer('sendAnnotation', annotation);
};

const getWhiteboardToolbarValues = () => {
  return {
    tool: Storage.getItem('whiteboardAnnotationTool'),
    thickness: Storage.getItem('whiteboardAnnotationThickness'),
    color: Storage.getItem('whiteboardAnnotationColor'),
  };
};

export default {
  sendAnnotation,
  getWhiteboardToolbarValues,
};
