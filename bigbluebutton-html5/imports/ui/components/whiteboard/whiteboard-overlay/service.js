import { callServer } from '/imports/ui/services/api/index.js';

const sendAnnotation = (annotation) => {
  callServer('sendAnnotation', annotation);
};

export default {
  sendAnnotation,
};
