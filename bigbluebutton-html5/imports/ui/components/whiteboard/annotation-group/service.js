import Annotations from '/imports/api/2.0/annotation';

const getCurrentAnnotations = (whiteboardId) => {
  if (!whiteboardId) {
    return null;
  }

  return Annotations.find({
    whiteboardId,
  }).fetch();
};

export default {
  getCurrentAnnotations,
};
