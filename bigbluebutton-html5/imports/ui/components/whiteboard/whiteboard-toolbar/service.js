import { callServer } from '/imports/ui/services/api/index.js';

const undoAnnotation = () => {
  callServer('undoAnnotation');
};

// const clearWhiteboard = () => {
//   callServer('clearWhiteboard');
// };

export default {
  undoAnnotation,
  // clearWhiteboard,
};
